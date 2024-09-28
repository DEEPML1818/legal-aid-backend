const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { connectDB } = require('./database'); // Connect to MongoDB
const Application = require('./models/Application'); // Mongoose model for applications

// Hyperledger Fabric imports
const { issueCertificate } = require('./hyperledgerService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to allow CORS
// Specify allowed origin for the frontend
const allowedOrigins = ['https://legal-aid-app-zeta.vercel.app/'];

app.UseCors(builder => builder
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowAnyOrigin()
 );

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://legal-aid-app-zeta.vercel.app/"); // Update with your frontend origin
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
    credentials: true // Enable cookies, if necessary
}));e(bodyParser.json());

// Connect to the database
connectDB();

// Multer memory storage (no more 'uploads' folder)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Application submission
app.post('/applications', upload.single('document'), async (req, res) => {
    const { name, email, salary } = req.body;
    const document = req.file; // The uploaded file

    // Check if the document was uploaded
    if (!document) {
        return res.status(400).send({ message: 'Document upload failed. No file received.' });
    }

    // Process the data and save it to the database
    const application = new Application({
        name,
        email,
        salary,
        document: document.buffer, // Save file as buffer
        status: 'pending',
        notes: []
    });

    try {
        const savedApplication = await application.save();
        res.status(201).send({ _id: savedApplication._id });
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).send({ message: 'Error saving application.' });
    }
});

// Route for file upload and AI assessment
app.post('/upload/:applicationId', upload.single('document'), async (req, res) => {
    try {
        const { applicationId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Read the file buffer from memory
        const buffer = req.file.buffer;

        // OCR Processing
        const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
            logger: info => console.log(info)
        });

        // AI Assessment Logic
        const assessment = await assessWithAI(text); // Call AI assessment function

        // Respond with the assessment
        res.status(200).json({
            message: 'File uploaded and processed successfully',
            assessment // Send back the assessment (green/red light)
        });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ message: 'Error processing the file' });
    }
});

// Route to get all approved applications
// Route to get all approved applications
app.get('/api/applications/approved', async (req, res) => {
    try {
        const approvedApps = await Application.find({ status: 'approved' });
        res.json(approvedApps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching approved applications' });
    }
});

// Get unsuccessful applications where the assessment is 'red'
app.get('/api/applications/unsuccessful', async (req, res) => {
    try {
        const unsuccessfulApps = await Application.find({ status: 'unsuccessful', assessment: 'red' });
        res.json(unsuccessfulApps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unsuccessful applications' });
    }
});

// Get applications by applicant's name
app.get('/api/applications/my-applications/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const applications = await Application.find({ name: new RegExp(name, 'i') }); // Case-insensitive search
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications' });
    }
});




// Placeholder for AI assessment function
const assessWithAI = async (text) => {
    // Implement your AI logic here
    // For example, return 'green' if text contains certain keywords, otherwise 'red'
    return text.toLowerCase().includes('approve') ? 'green' : 'red';
};

// Express route for issuing certificates
app.post('/api/issue-certificate', async (req, res) => {
    const { applicationId, applicantName, assessment } = req.body;

    try {
        // Call the certificate issuance logic
        const result = await issueCertificate(applicationId, applicantName, assessment);

        if (result.success) {
            // Find the application by its ID
            const application = await Application.findById(applicationId);

            if (!application) {
                return res.status(404).json({ message: 'Application not found' });
            }

            // Update the application status to "approved" if the assessment is green
            application.status = assessment === 'green' ? 'approved' : 'pending';

            // Append the certificateId to the notes
            application.notes.push(`Certificate ID: ${result.certificateId}`);

            // Save the updated application in MongoDB
            await application.save();

            return res.status(200).json({
                message: 'Certificate issued and application status updated',
                certificateId: result.certificateId,
                status: application.status
            });
        } else {
            throw new Error('Failed to issue certificate');
        }
    } catch (error) {
        console.error('Error issuing certificate:', error.message);
        return res.status(500).json({ message: 'Failed to issue certificate' });
    }
});


// Route to flag an application and add notes
app.post('/api/applications/:id/flag', async (req, res) => {
    const { notes } = req.body; // Expect notes from the request body
    try {
        const app = await Application.findById(req.params.id);

        if (!app) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Update the status to 'flagged'
        app.status = 'flagged';

        // Append the feedback to the notes array
        app.notes.push(notes);

        // Save the updated application in MongoDB
        await app.save();

        // Respond back with the updated application
        res.json({ message: 'Application flagged successfully', application: app });
    } catch (error) {
        res.status(500).json({ message: 'Error flagging application' });
    }
});

// Route to get all flagged applications
app.get('/api/applications/flagged', async (req, res) => {
    try {
        const flaggedApps = await Application.find({ status: 'flagged' });
        res.json(flaggedApps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching flagged applications' });
    }
});

// Route to get all unsuccessful applications
app.get('/api/applications/unsuccessful', async (req, res) => {
    try {
        const unsuccessfulApps = await Application.find({ status: 'unsuccessful' });
        res.json(unsuccessfulApps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unsuccessful applications' });
    }
});




// Route for issuing certificates
app.post('/api/issue-certificate', async (req, res) => {
    const { applicationId, applicantName, assessment } = req.body;

    const result = await issueCertificate(applicationId, applicantName, assessment);
    if (result.success) {
        return res.status(200).json({ message: 'Certificate issued successfully' });
    } else {
        return res.status(500).json({ message: 'Failed to issue certificate', error: result.error });
    }
});


// Get all applications
app.get('/api/applications', async (req, res) => {
    try {
        const applications = await Application.find(); // Fetch from your DB
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

// Get successful applications
app.get('/api/applications/successful', async (req, res) => {
    try {
        const successfulApps = await Application.find({ status: 'successful' });
        res.json(successfulApps);
    } catch (error) {
        console.error('Error fetching successful applications:', error);
        res.status(500).json({ message: 'Error fetching successful applications' });
    }
});

// Get unsuccessful applications
app.get('/api/applications/unsuccessful', async (req, res) => {
    try {
        const unsuccessfulApps = await Application.find({ status: 'unsuccessful' });
        res.json(unsuccessfulApps);
    } catch (error) {
        console.error('Error fetching unsuccessful applications:', error);
        res.status(500).json({ message: 'Error fetching unsuccessful applications' });
    }
});

// Update flagged applications
app.post('/api/applications/:id/flag', async (req, res) => {
    const { notes } = req.body;
    try {
        const app = await Application.findById(req.params.id);
        app.status = 'flagged';
        app.notes.push(notes); // Assuming notes is an array in your model
        await app.save();
        res.json({ message: 'Application flagged successfully', application: app });
    } catch (error) {
        console.error('Error flagging application:', error);
        res.status(500).json({ message: 'Error flagging application' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
