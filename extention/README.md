# YouTube Learning Mode Extension

## Overview

The YouTube Learning Mode extension transforms YouTube videos into interactive learning experiences. This folder contains the frontend code for the Chrome extension

## Project Structure

```
extention/
│
├── components/             # React-style components for the frontend
│   ├── chatContainer.js    # Chat UI component for the learning mode
│   ├── learningModeToggle.js # Toggle switch component for enabling/disabling learning mode
│   └── waitForElement.js   # Utility function to wait for a specific DOM element
│
├── css/
│   └── styles.css          # (Optional) Custom CSS styles for the extension
│
├── images/                 # Directory for storing image assets
│
├── js/                     # Compiled JavaScript files
│   ├── background.js       # Background script for Chrome extension
│   ├── content.bundle.js   # Bundled content script (output of Webpack)
│   ├── content.js          # Original content script before bundling
│   └── content.bundle.js.map # Source map for content.bundle.js
│
├── node_modules/           # Node.js dependencies
│
├── popup.html              # HTML for the extension's popup
├── popup.js                # JavaScript for the extension's popup
├── webpack.config.js       # Webpack configuration file
├── package.json            # NPM package configuration file
├── package-lock.json       # Lockfile for npm dependencies
├── manifest.json           # Chrome extension manifest file
└── README.md               # This README file
```

## Getting Started

### Prerequisites

- Node.js and npm (or Yarn) installed
- Google Chrome or a Chromium-based browser

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the project:**

We use Webpack to bundle our JavaScript files. This process is necessary because modern web development often involves splitting code into multiple files and modules. Bundling combines these files into a single script that can be easily loaded by the browser, especially for a Chrome extension.

To build the project, run:

   ```bash
   npx webpack --config webpack.config.js
   ```

Why is this required?

Webpack: Webpack is a powerful tool that takes modules with dependencies and generates static assets representing those modules. In this case, it bundles your multiple JavaScript files into one content.bundle.js file. This bundled file is what gets executed in the context of the Chrome extension.
npx: The npx command comes with npm (Node Package Manager) and allows you to run binaries (like Webpack) from the node_modules directory without globally installing them. This ensures that everyone working on the project uses the same version of the tools.
After running this command, you should see the content.bundle.js file in the js/ directory. This is the file that the Chrome extension will load when it runs.


3. **Load the extension in Chrome:**

   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" using the toggle in the top right.
   - Click "Load unpacked" and select the `extention` directory.

## Creating New Components

When creating new components for the frontend:

1. **Create the Component File:**
   - Place the file in the `components/` directory.
   - Follow the naming convention: `ComponentName.js`.

2. **Structure of a Component:**

   Components should be self-contained functions or classes that export a single function. Example:

   ```javascript
   export function MyComponent(props) {
       const element = document.createElement('div');
       // Add your component's logic and styling here
       return element;
   }
   ```

3. **Importing Components:**

   In your `content.js` or other scripts, import the components as needed:

   ```javascript
   import { MyComponent } from '../components/MyComponent.js';
   ```

4. **Injecting Components into the DOM:**

   Use a utility function like `waitForElement` to ensure the DOM is ready before injecting components:

   ```javascript
   waitForElement('.target-element', (parentElement) => {
       const myComponent = MyComponent();
       parentElement.appendChild(myComponent);
   });
   ```

## Future Frontend Features

For any new frontend feature:

1. **Create a new component in `components/`.**
2. **Write any required styles in `css/styles.css`.**
3. **Test the feature by building the project with Webpack.**
4. **Ensure all components are modular and follow best practices for DOM manipulation and event handling.**

## Backend (Go)

For backend logic, you can find the Go files under the `backend/` directory. The backend is meant to handle any server-side logic required by the extension.

## Contributing

If you'd like to contribute:

1. Fork this repository.
2. Create a new branch for your feature.
3. Commit your changes and push them to your branch.
4. Create a pull request to merge your changes into the main branch.
