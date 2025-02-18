const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { body, param, validationResult } = require('express-validator');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;
const DIRECTORY = __dirname; 

app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'File Manager API',
            version: '1.0.0',
            description: 'API to manage local files',
        },
    },
    apis: ['./index.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /open-explorer:
 *   get:
 *     summary: Opens the file explorer
 *     responses:
 *       200:
 *         description: File explorer opened successfully
 */
app.get('/open-explorer', (req, res) => {
    let command = process.platform === 'darwin' ? 'open .' 
                : process.platform === 'win32' ? 'start .' 
                : process.platform === 'linux' ? 'nautilus .' 
                : null;

    if (!command) return res.status(400).json({ error: 'Unsupported platform' });

    exec(command, (error) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'File explorer opened successfully' });
    });
});

/**
 * @swagger
 * /files:
 *   post:
 *     summary: Creates a new dummy file
 *     parameters:
 *       - in: body
 *         name: filename
 *         schema:
 *           type: object
 *           properties:
 *             filename:
 *               type: string
 *         required: true
 *     responses:
 *       201:
 *         description: File created successfully
 */
app.post('/files', [
    body('filename').isString().trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { filename } = req.body;
    const filePath = path.join(DIRECTORY, filename);

    fs.writeFile(filePath, 'Hello World!', (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'File created successfully' });
    });
});

/**
 * @swagger
 * /files/{filename}:
 *   patch:
 *     summary: Updates part of a file
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *     responses:
 *       200:
 *         description: File updated successfully
 */
app.patch('/files/:filename', [
    param('filename').isString().trim().escape()
], (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(DIRECTORY, filename);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    fs.appendFile(filePath, '\nUpdated content', (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'File updated successfully' });
    });
});

/**
 * @swagger
 * /files/{filename}:
 *   put:
 *     summary: Replaces the content of a file
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *     responses:
 *       200:
 *         description: File replaced successfully
 */
app.put('/files/:filename', [
    param('filename').isString().trim().escape()
], (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(DIRECTORY, filename);

    fs.writeFile(filePath, 'Replaced Content!', (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'File replaced successfully' });
    });
});

/**
 * @swagger
 * /files/{filename}:
 *   delete:
 *     summary: Deletes a file
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
app.delete('/files/:filename', [
    param('filename').isString().trim().escape()
], (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(DIRECTORY, filename);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    fs.unlink(filePath, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'File deleted successfully' });
    });
});

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Lists all files
 *     responses:
 *       200:
 *         description: List of files
 */
app.get('/files', (req, res) => {
    fs.readdir(DIRECTORY, (err, files) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ files });
    });
});

app.listen(PORT, () => console.log(`Server running at http://YOUR_DIGITAL_OCEAN_IP:${PORT}`));