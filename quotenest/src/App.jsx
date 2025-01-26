import React, { useEffect, useState } from "react"
import '@mantine/core/styles.css';
import {
  MantineProvider,
  Button,
  Space,
  Accordion,
  Title,
  Center,
  Card,
  List,
  Autocomplete,
  createTheme,
  rem,
  Box,
  NumberInput,
  Modal,
  Textarea,
  HoverCard,
  Text
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { IconTrashFilled } from '@tabler/icons-react'


const theme = createTheme({
  colors: {

    deepBlue: [
      '#fdf7ee',
      '#f7eadd',
      '#efd1b8',
      '#e6b897',
      '#dc9f77',
      '#d18b63',
      '#c57d5b',
      '#b06d4f',
      '#9c5f46',
      '#874f3c',
    ],

    blue: [
      '#f9f5ee',
      '#f0e6d8',
      '#e0d0b2',
      '#cfb38c',
      '#bfa174',
      '#ac9163',
      '#9b825a',
      '#826e4f',
      '#725f46',
      '#5f4e3c',
    ],
  },

  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .15)',
    xl: '4px 4px 5px rgba(0, 0, 0, .2)',
  },

  headings: {
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      h1: { fontSize: rem(36) },
    },
  },
});



function App() {
  const [lists, setLists] = useState(() => {
    const storedLists = localStorage.getItem("lists");
    return storedLists ? JSON.parse(storedLists) : []
  })
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [pageNo, setPageNo] = useState("")
  const [opened, { open, close }] = useDisclosure(false);

  {/* Title suggestion filter */ }
  const [debouncedSearch] = useDebouncedValue(title, 1000)
  const titles = lists.map((item) => item.title).filter((title) => title.toLowerCase().includes(debouncedSearch.toLocaleLowerCase()));


  useEffect(() => {
    localStorage.setItem("lists", JSON.stringify(lists))
  }, [lists])

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

  const handleAddQuote = () => {
    if (title.trim() !== '') {
      open(); // 
    }
  };

  const handleDeleteBook = (id) => {
    setLists((prevList) => prevList.filter((list) => list.id !== id));
  }

  const handleDeleteQuote = (bookId, quoteId) => {
    setLists((prevLists) => prevLists.map((list) =>
      list.id === bookId ? { ...list, quotes: list.quotes.filter((quote) => quote.id !== quoteId) } : list
    ))
  }

  {/* List mapping */ }
  const items = lists.map((item) => (
    <Accordion.Item key={item.id} value={item.title}>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
        <Accordion.Control>
          {item.title}
        </Accordion.Control>
        <Button
          color="red"
          variant="light"
          onClick={() => handleDeleteBook(item.id)}
          style={{ marginLeft: "auto" }}
        >
          <IconTrashFilled size={14} />
        </Button>
      </Box>
      <Accordion.Panel>
        <List type="ordered">
          {item.quotes.map((quote) => (
            <Card key={quote.id}>
              <List.Item key={quote.id}>
                <Box>
                  <span>{quote.description} (p{quote.pageNo})</span>
                  <Button
                    color="red"
                    variant="light"
                    onClick={() => handleDeleteQuote(item.id, quote.id)}
                    style={{ marginLeft: 8 }}
                  >
                    <IconTrashFilled size={12} />
                  </Button>
                </Box>
              </List.Item>
            </Card>
          ))}
        </List>
      </Accordion.Panel>
    </Accordion.Item>
  ))

  return (
    <MantineProvider theme={theme}>
      <Center>
        <h1>QuoteNest</h1>
      </Center>
      <Space h="md"></Space>
      <form>
        <Autocomplete
          placeholder="Add Bookname here"
          value={title}
          data={titles}
          onChange={setTitle}
          required />
      </form>

      <Space h="md"></Space>

      <Center>
        <HoverCard width={200} shadow="md">
          <HoverCard.Target>
            <Button variant="default" onClick={handleAddQuote}>
              Add a quote
            </Button>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">
              {title.trim() === ''
                ? 'Please enter a book name before adding a quote.'
                : 'You can now add a quote!'}
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Center>
      <Modal opened={opened} onClose={close} title="Enter description and page number">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add description here"
          required />
        <NumberInput
          value={pageNo}
          onChange={setPageNo}
          placeholder="Add page number here"
        />
        <Space h="lg"></Space>
        <Center><Button onClick={handleAdd}>Save</Button></Center>
      </Modal>

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
