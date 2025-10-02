# QuoteNest

**QuoteNest** is a full-stack quote and reading-note management application designed for book enthusiasts. It provides a seamless way to save, organize, and revisit quotes or notes from books, with features such as drag-and-drop reordering, dark/light mode, and optional cloud synchronization across devices.

---

## Features

* **Quote Management** – Save quotes with book title, page number, and description.
* **Favorites Section** – Highlight and manage favorite quotes separately.
* **Drag & Drop Reordering** – Reorganize quotes with intuitive interactions (`@hello-pangea/dnd`).
* **Dark/Light Mode** – Built-in theme switching for accessibility and comfort.
* **Local Storage Persistence** – Automatically saves data in-browser for offline access.
* **PWA Support** – Installable as a Progressive Web App, enabling offline usage and a native-like experience.

---

## Tech Stack

* **Frontend:** React.js, Mantine UI, Tabler Icons
* **State Management:** React Hooks (`useState`, `useEffect`, `useListState`, `useDisclosure`)
* **Cloud Services:** Firebase Authentication, Firestore (NoSQL)
* **UI/UX Enhancements:** `react-hot-toast`, Mantine Notifications
* **Build Tools:** Vite

---

## Getting Started

### Prerequisites

* Node.js (v18 or later recommended)
* npm or yarn

### Installation

```bash
git clone https://github.com/your-username/quotenest.git
cd quotenest
npm install
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Production Build

```bash
npm run build
```

---

## License

This project is licensed under the [MIT License](LICENSE).
