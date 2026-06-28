# Code Analyzer

Code Analyzer is an AI-powered web application that helps developers understand unfamiliar GitHub repositories in minutes. Instead of manually browsing hundreds of files, users simply provide a public GitHub repository URL and receive an organized analysis of the project's structure, files, and overall architecture.

The application is designed for developers, students, and open-source contributors who want to quickly understand a codebase before making changes or contributing.

---

## Features

- Analyze any public GitHub repository
- Automatically retrieve repository information
- Generate an overview of the project structure
- AI-powered explanation of source files
- Understand project architecture without reading every file
- Clean and responsive user interface
- Fast analysis workflow

---

## How It Works

1. Enter a public GitHub repository URL.
2. The application fetches the repository contents.
3. The repository structure is processed.
4. Source files are analyzed using an AI model.
5. A detailed report is generated explaining:
   - Repository overview
   - Folder structure
   - Purpose of important files
   - Overall project architecture
   - Code insights

---

## Tech Stack

### Frontend

- React
- Tailwind CSS
- JavaScript

### Backend

- Node.js
- Express.js

### APIs

- GitHub API
- AI model for repository analysis

---

## Project Structure

```
Code-Analyzer/
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── utils/
│
├── package.json
└── README.md
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/kgupta1502/Code-Analyzer.git
```

Navigate into the project

```bash
cd Code-Analyzer
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

---

## Usage

1. Launch the application.
2. Paste the URL of a public GitHub repository.
3. Click **Analyze**.
4. Wait for the analysis to complete.
5. Review the generated repository insights.

---

## Example

Input

```
https://github.com/facebook/react
```

Output

- Repository information
- Project structure
- File summaries
- Architecture overview
- AI-generated explanation of the codebase

---

## Use Cases

- Learning unfamiliar codebases
- Preparing for open-source contributions
- Understanding project architecture
- Reviewing repositories before cloning
- Exploring new technologies
- Academic and educational purposes

---

## Future Improvements

- Support for private repositories
- Repository visualization
- Dependency graph generation
- Code quality metrics
- Security analysis
- Export reports as PDF
- Repository comparison
- Multi-language support
- Search within generated analysis

---

## Contributing

Contributions are welcome.

If you have ideas for improvements or discover any issues, feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Author

**Krishna Gupta**

GitHub: https://github.com/kgupta1502
