import React, { useState } from "react"
import '@mantine/core/styles.css';

import {
  MantineProvider,
  Button,
  TextInput,
  Space,
  Accordion,
  Title,
  Center,
  Card,
  List
} from "@mantine/core";


function App() {
  const [lists, setLists] = useState([])
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [pageNo, setPageNo] = useState("")
  const [filteredLists, setFilteredLists] = useState([]);

  const handleAdd = () => {
    if (title.trim() === "" || text.trim() === "") return;

    const existingTitle = lists.find((list) => list.title.trim().toLowerCase() === title.trim().toLowerCase());

    if (existingTitle) {
      const updatedQuotes = [...existingTitle.quotes, { id: Date.now(), description: text, pageNo: pageNo || ". N/A" }];
      setLists(lists.map((list) => (list.id === existingTitle.id ? { ...list, quotes: updatedQuotes } : list)))
    } else {
      setLists([
        ...lists,
        {
          id: Date.now(),
          title: title,
          quotes: [{ id: Date.now(), description: text, pageNo: pageNo || ". N/A" }]
        }
      ])
    }

    setTitle("")
    setText("")
    setPageNo("")
  }

  const handleTitleChange = (event) => {
    const inputTitle = event.target.value.trim().toLowerCase();
    setTitle(event.target.value);

    if (inputTitle === '') {
      setFilteredLists([]);
    } else {
      const filtered = lists.filter((list) =>
        list.title.toLowerCase().includes(inputTitle)
      );
      setFilteredLists(filtered);
    }
  };

  const items = lists.map((item) => (
    <Accordion.Item key={item.id} value={item.title}>
      <Accordion.Control>{item.title}</Accordion.Control>
      <Accordion.Panel>
        <List type="ordered">
          {item.quotes.map((quote) => (
            <Card key={quote.id}>
              <List.Item key={quote.id}>
                {quote.description} (p{quote.pageNo})
              </List.Item>
            </Card>
          ))}
        </List>
      </Accordion.Panel>
    </Accordion.Item>
  ))

  return (
    <MantineProvider>
      <Center>
        <Title order={1}>QuoteNest</Title>
      </Center>
      <Space h="md"></Space>
      <form>
        <TextInput
          value={title}
          onChange={handleTitleChange}
          placeholder="Add Bookname here"
          required />
        <TextInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add description here"
          required />
        <TextInput
          value={pageNo}
          onChange={(e) => setPageNo(e.target.value)}
          placeholder="Add page number here"
        />
      </form>
      {filteredLists.length > 0 && (
        <List>
          {filteredLists.map((list) => (
            <List.Item key={list.id} onClick={() => { setTitle(list.title); setFilteredLists([]) }}>
              {list.title}
            </List.Item>
          ))}
        </List>
      )}
      <Space h="md"></Space>
      <Center><Button onClick={handleAdd}>Save</Button></Center>

      <Space h="lg"></Space>

      <Center>
        <Title order={2}>Quotes</Title>
      </Center>

      <Space h="md"></Space>

      <Card>
        <Accordion defaultValue={"Notes"}>
          {items.length > 0 ? (
            <Accordion>
              {items}
            </Accordion>
          ) : (
            <span>No quotes added yet. Start by adding a quote</span>
          )}
        </Accordion>
      </Card>
    </MantineProvider>
  )
}

export default App
