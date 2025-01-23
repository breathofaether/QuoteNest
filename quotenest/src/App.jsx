import React, { useState } from "react"
import '@mantine/core/styles.css';
import { MantineProvider, Button, Container, Group, Text } from '@mantine/core';

function App() {
  const [shelves, setShelves] = useState([])
  const [lists, setLists] = useState([])
  const [text, setText] = useState('')

  let isShelf = true

  const handleAdd = () => {
    if (text.trim()) {
      if (isShelf) {
        const shelf = {
          id: Date.now(),
          title: text,
          isEditing: false
        }
        setShelves([...shelves, shelf])
        setText('')
      } else {
        const list = {
          id: Date.now(),
          title: text,
          isEditing: false
        }
        setLists([...lists, list])
        setText('')
      }
    }
  }

  const handleEdit = (id) => {
    if (isShelf) {
      setShelves((shelf) => shelf.map((item) => item.id === id ? { ...item, isEditing: true } : item))
    } else {
      setLists((list) => list.map((item) => item.id === id ? { ...item, isEditing: true } : item)
      )
    }
  }

  const handleUpdate = (id, newTitle) => {
    if (isShelf) {
      setShelves((shelf) =>
        shelf.map((item) =>
          item.id === id ? { ...item, title: newTitle, isEditing: false } : item
        )
      );
    } else {
      setLists((list) =>
        list.map((item) =>
          item.id === id ? { ...item, title: newTitle, isEditing: false } : item
        )
      );
    }
  };

  const handleKeyPress = (e, id) => {
    if (e.key === "Enter") {
      handleUpdate(id, e.target.value)
    }
  }

  const handleDelete = (id) => {
    if (isShelf) {
      setShelves((prevShelves) => prevShelves.filter((shelf) => shelf.id != id))
    } else {
      setLists((prevLists) => prevLists.filter((list) => list.id != id))
    }
  }

  return (
    <div>
      <h1>
        QuoteNest
      </h1>
      <input
        type="text"
        placeholder="Enter list/shelf name"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={() => { isShelf = true; handleAdd() }}>Add a shelf</button>
      <button onClick={() => { isShelf = false; handleAdd() }}>Add a list</button>
     
      <div>
        <h4>Shelves</h4>
        {shelves.length > 0 ? (
          <div>
            {shelves.map((item) => (
              <ul>
                <li key={item.id}>
                  {item.title}
                  <button onClick={() => { isShelf = true; handleDelete(item.id); }}>Delete</button>
                </li>
              </ul>
            ))}
          </div>
        ) : (
          <span>No shelves created yet.</span>
        )}
      </div>
     
      <div>
        <h4>Standalone Lists</h4>
        {lists.length > 0 ? (
          <div>
            {lists.map((item) => (
              <ul>
                <li key={item.id}>
                  {item.title}
                  <button onClick={() => { isShelf = false; handleDelete(item.id); }}>Delete</button>
                </li>
              </ul>
            ))}
          </div>
        ) : (
          <span>No standalone lists created yet.</span>
        )}
      </div>
    </div>
  )
}

export default App
