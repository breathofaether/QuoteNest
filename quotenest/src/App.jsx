import React, { useState } from "react"
import '@mantine/core/styles.css';
import { MantineProvider, Button, Container, Group, Text } from '@mantine/core';

function App() {
  const [shelves, setShelves] = useState([])
  const [lists, setLists] = useState([])
  const [text, setText] = useState('')
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [nestedQuote, setNestedQuote] = useState("")
  const [pageNo, setPageNo] = useState('')

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
          isEditing: false,
          quotes: [],
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

  const handleUpdate = (id, newTitle, isShelf) => {
    console.log("Triggered")
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

  const handleKeyPress = (e, id, isShelf) => {
    if (e.key === "Enter") {
      handleUpdate(id, e.target.value, isShelf)
    }
  }

  const handleDelete = (id) => {
    if (isShelf) {
      setShelves((prevShelves) => prevShelves.filter((shelf) => shelf.id != id))
    } else {
      setLists((prevLists) => prevLists.filter((list) => list.id != id))
    }
  }

  const openModal = (id) => {
    setSelectedItemId(id);
  }

  const closeModal = () => {
    setSelectedItemId(null)
    setNestedQuote("");
  }

  const addNestedQuote = () => {
    if (nestedQuote.trim() === "") return;
    setLists((prevLists) =>
      prevLists.map((item) => item.id === selectedItemId ? {
        ...item, quotes: [...item.quotes, { id: Date.now(), text: nestedQuote, page: pageNo }]
      } : item))
      setNestedQuote("")
      setPageNo("")
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
            <ul>
              {shelves.map((item) => (
                <li key={item.id}>
                  {item.isEditing ? (
                    <div>
                      <input
                        type="text"
                        defaultValue={item.title}
                        onKeyDown={(e) => handleKeyPress(e, item.id, isShelf = true)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      <span>{item.title}</span>
                      <button onClick={() => { isShelf = true; handleDelete(item.id); }}>Delete</button>
                      <button onClick={() => { isShelf = true; handleEdit(item.id) }}>Edit</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <span>No shelves created yet.</span>
        )}
      </div>

      <div>
        <h4>Standalone Lists</h4>
        {lists.length > 0 ? (
          <div>
            <ul>
              {lists.map((item) => (
                <li key={item.id}>
                  {item.isEditing ? (
                    <div>
                      <input
                        type="text"
                        defaultValue={item.title}
                        onKeyDown={(e) => handleKeyPress(e, item.id, isShelf = false)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      <span onClick={() => openModal(item.id)}>{item.title}</span>
                      {selectedItemId && (
                        <div>
                          <h3>{lists.find((item) => item.id === selectedItemId).title}</h3>
                          <ul>
                            {lists.find((item) => item.id === selectedItemId)
                              .quotes.map((quote) => (
                                <li key={quote.id}>{quote.text} (p{quote.page})</li>
                              ))}
                          </ul>
                          <form>
                            <input
                              type="text"
                              value={nestedQuote}
                              onChange={(e) => setNestedQuote(e.target.value)}
                              placeholder="Add notes here"
                              required
                            />
                            <input
                              type="text"
                              value={pageNo}
                              onChange={(e) => setPageNo(e.target.value)}
                              placeholder="Add page number here"
                            />
                          </form>
                          <button onClick={addNestedQuote}>Add</button>
                          <button onClick={closeModal}>Close</button>
                        </div>
                      )}

                      <button onClick={() => { isShelf = false; handleDelete(item.id); }}>Delete</button>
                      <button onClick={() => { isShelf = false; handleEdit(item.id) }}>Edit</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <span>No standalone lists created yet.</span>
        )}
      </div>
    </div>
  )
}

export default App
