# Plasma Fusion Tools Frontend

## Description

This web application allows users to explore, analyze, and generate automatic reports based on nuclear fusion data from the TJ-II device.  
The interface connects to multiple backend microservices to provide advanced functionalities such as signal processing, CSV data querying, and report generation.

---

## Technologies Used

- **Frontend**:
  - React
  - Vite
  - JavaScript (ES6)
  - CSS
- **Backend Requirements**:
  - FastAPI
  - Python 3
  - Google Generative AI (Gemini)
  - Replicate API (LLaMA-2)

---

## Local Installation and Execution

> Make sure you have [Node.js](https://nodejs.org/) installed.

1. Install dependencies:
   ```
   npm install
   ```

2. Start development server:
   ```
   npm run dev
   ```

---

## Main Frontend Structure

```text
frontend/
 ├── src/
 │   ├── components/
 │   ├── pages/
 │   │   ├── CsvPage.jsx
 │   │   ├── LoadCsvPage.jsx
 │   │   ├── PlotPage.jsx
 │   │   ├── ReportPage.jsx
 │   ├── App.jsx
 │   ├── main.jsx
 │   ├── App.css
 └── public/
```

Each `Page` component corresponds to a specific core functionality of the application.

---

## Main Functionalities

### 1. CSV Querying (`CsvPage.jsx`)

- Allows users to ask natural language questions about a previously uploaded CSV dataset.
- Sends queries to the backend microservice and displays the AI-generated answer.

---

### 2. CSV Upload (`LoadCsvPage.jsx`)

- Allows users to upload a `.csv` file.
- Enables natural language querying directly over the uploaded dataset.
- Performs two types of API calls:
  - File upload.
  - Question answering over the CSV data.

---

### 3. Signal Plotting and AI Assistant (`PlotPage.jsx`)

- Offers two modes:
  - **SimilPatternTool**: Finds signals similar to a selected plasma discharge and generates a comparison plot.
  - **TJ-II Data Display**: Displays specific plasma signals from the TJ-II database.
- Sends user queries to different backend microservices depending on the selected mode.

---

### 4. Report Generation (`ReportPage.jsx`)

- Automatically generates a **PDF** and **Word** report based on previous sessions.
- Allows users to download the generated reports.
- Provides an option to reset the analysis context to start a new session.

---

## Demo Videos

You can find demo videos showcasing the main functionalities of the application [here](./my-dashboard/README.md).

Each demo corresponds to a different page:
- CSV Querying
- CSV Upload
- Signal Plotting and AI Assistant
- Report Generation

---

**Components**:
- **Button.jsx**: Custom button component.
- **Card.jsx**: Reusable card component for displaying content.

---

### Application Initialization

- **App.jsx**:  
  Defines the main navigation structure of the app using **React Router**.  
  It maps each URL path (e.g., `/csv`, `/plot`, `/report`) to its corresponding page component.

- **main.jsx**:  
  Main entry point of the React application.  
  It initializes the app inside the HTML `<div id="root"></div>`, wraps it with `BrowserRouter` for routing support, and applies global styles from `index.css`.

---

## Frontend ↔ Backend API Connections

Each frontend page communicates with a specific backend service:

| Functionality             | Frontend Page     | Backend Endpoint Base          |
|:---------------------------|:------------------|:-------------------------------|
| CSV Querying               | CsvPage.jsx        | `http://localhost:5002/ask_csv` |
| CSV Upload and Querying    | LoadCsvPage.jsx    | `http://localhost:5001/upload` and `http://localhost:5001/ask` |
| SimilPatternTool           | PlotPage.jsx       | `http://localhost:5004/extract_shot_number_and_database`, `http://localhost:5004/ask_gemini` |
| TJ-II Data Display         | PlotPage.jsx       | `http://localhost:5003/get_tjii_plot` |
| Report Generation          | ReportPage.jsx     | `http://localhost:5005/generate_report` and `http://localhost:5005/reset_context` |

All endpoints are accessed via `fetch` calls with `mode: "cors"` enabled to allow frontend-backend communication.

---

## Key Configuration Files

- **index.html**:  
  Main HTML template used by Vite. It defines the root `<div id="root"></div>` where the React application is mounted. It also links to the `main.jsx` entry point.

- **vite.config.js**:  
  Configures Vite for building and serving the React app. (Default setup, no major customizations.)

- **eslint.config.js**:  
  Configures ESLint to enforce consistent code style and best practices across the project.  
  It includes recommended rules for JavaScript, React Hooks, and React Refresh.

- **package.json**:  
  Contains project metadata, dependencies (like `react`, `vite`, `eslint`), and useful scripts such as `npm run dev` for local development.

- **package-lock.json**:  
  Automatically generated file that locks dependency versions to ensure consistent installations across different environments.

--- 

## Important Notes

- The backend microservices must be running locally for the frontend to work properly.
- API keys for **Google Generative AI** and **Replicate** must be configured in `.env` files on the backend side.
- Make sure ports `5001` to `5005` are free and available, or adjust the endpoints if necessary.
- `sessionStorage` is used to preserve user query history during the session.


## Dependencies

- **React** (Frontend framework)
- **Vite** (Build tool and development server)
- **ESLint** (Code linting and style checking)
- **React Router** (Navigation between pages)


## Additional Features

- The application allows direct download of generated plots (`.png`) from the UI.
- Minimalist and clean CSS design focused on usability and clear information display.
- The report generator combines results from different functionalities into one single, structured document.

---
