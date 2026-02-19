# Quartz Markets

Prediction Market Intelligence with AI-powered analysis

## Deployment Instructions

### To deploy on Vercel:

1. Delete your old repository on GitHub
2. Create a new repository called "quartz-markets"
3. Upload ALL these files to the repository (keep the folder structure)
4. Go to Vercel and reimport the project
5. Vercel will automatically detect it's a React app and deploy correctly

### File Structure:
```
quartz-markets/
├── public/
│   └── index.html
├── src/
│   ├── App.js       (your main component)
│   ├── index.js     (entry point)
│   └── index.css    (styles)
├── package.json     (dependencies)
├── .gitignore
└── README.md
```

## Local Development

```bash
npm install
npm start
```

Your app will open at http://localhost:3000

## Build for Production

```bash
npm run build
```

---

Built with React + Lucide Icons
