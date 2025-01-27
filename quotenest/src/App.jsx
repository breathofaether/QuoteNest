import React, { useEffect, useState } from "react"
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
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
  Text,
  Container,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { IconTrashFilled } from '@tabler/icons-react'

const theme = createTheme({
  colors: {
    gray: [
      '#f8f8f8',
      '#f2f2f2',
      '#e6e6e6',
      '#d9d9d9',
      '#cccccc',
      '#b3b3b3',
      '#999999',
      '#808080',
      '#666666',
      '#4d4d4d',
    ],

    offWhite: [
      '#fefefe',
      '#f9f9f9',
      '#f5f5f5',
      '#f2f2f2',
      '#f0f0f0',
      '#e8e8e8',
      '#e1e1e1',
      '#d7d7d7',
      '#cccccc',
      '#c0c0c0',
    ],

    cream: [
      '#fefae0',
      '#fef3c3',
      '#fee7a6',
      '#feed80',
      '#f9e960',
      '#f6e540',
      '#f4e120',
      '#f2dd00',
      '#f0d900',
      '#eecd00',
    ],

    brown: [
      '#f5e5cd',
      '#eeb97c',
      '#e69138',
      '#d96e00',
      '#cc4c00',
      '#b92b00',
      '#a01100',
      '#800000',
      '#600000',
      '#400000',
    ],
  },

  shadows: {
    md: '0 1px 2px rgba(0, 0, 0, 0.05)',
    xl: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  headings: {
    fontFamily: 'Lora, serif',
    fontWeight: 400,
    sizes: {
      h1: { fontSize: rem(38) },
    },
  },

  fontFamily: 'Lora, serif',
  lineHeight: 1.5,

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
      open();
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
    <Container size={"md"}>
      <Accordion.Item key={item.id} value={item.title}>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <Accordion.Control icon={"❝"}>
            <Title order={4}>{item.title}</Title>
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
          <List type="ordered" spacing="sm">
            {item.quotes.map((quote) => (
              <Card
                key={quote.id}
                withBorder shadow="sm"
                radius="md"
                style={{ marginBottom: "10px" }}
              >
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
    </Container>
  ))

  return (
    <MantineProvider theme={theme}>
      <Space h="lg"></Space>
      <Center>
        <Title order={1}>QuoteNest</Title>
      </Center>
      <Space h="md"></Space>
      <Container size={"sm"}>
        <form>
          <Autocomplete
            placeholder="Add Bookname here"
            value={title}
            data={titles}
            onChange={setTitle}
            required
          />
        </form>
      </Container>

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
        <Space h={"xs"} />
        <NumberInput
          value={pageNo}
          onChange={setPageNo}
          placeholder="Add page number here (optional)"
        />
        <Space h="xs"></Space>
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
            <Center><span>No quotes added yet. Start by adding a quote</span></Center>
          )}
        </Accordion>
      </Card>
    </MantineProvider>
  )
}

export default App
