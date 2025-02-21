import React, { useEffect, useState } from "react"
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/spotlight/styles.css';
import classes from './DndList.module.css';
import cx from 'clsx';

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
  Textarea,
  HoverCard,
  Text,
  Container,
  Menu,
  Avatar,
  useMantineColorScheme,
  useComputedColorScheme,
  Drawer,
  ActionIcon,
  ThemeIcon,
  Affix,
  Transition,
  CopyButton,
  Tooltip,
  Flex,
  Divider,

} from "@mantine/core";
import { ModalsProvider, modals } from '@mantine/modals';
import { Spotlight, spotlight } from '@mantine/spotlight';
import { useListState, useWindowScroll } from '@mantine/hooks';
import { useDebouncedValue, useDisclosure, useClipboard } from "@mantine/hooks";
import { notifications, Notifications } from '@mantine/notifications';
import { toast, Toaster } from 'react-hot-toast';

import { IconTrashFilled, IconX, IconCheck, IconLogin2, IconSearch, IconCopyCheck, IconQuoteFilled, IconQuotes, IconArrowUp, IconCirclePlusFilled, IconHeart, IconPencilCheck, IconArrowBackUp, IconMoonFilled, IconSunFilled, IconEdit, IconHeartFilled, IconTrash, IconCopy, IconLogout, IconCloudUp, IconMessageExclamation, } from '@tabler/icons-react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { AuthenticationForm } from "./auth/AuthenticationForm";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./auth/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";


function ThemeSwitcher() {
  const { colorScheme, setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });

  const handleThemeSwitch = () => {
    setColorScheme(computedColorScheme === "light" ? "dark" : "light");
  };

  return (
    <ActionIcon onClick={handleThemeSwitch} variant="default" radius="xl" size={39} style={{ position: "absolute", top: "14.5px", right: "55px", zIndex: 1000 }}>
      {colorScheme === "light" ? <IconMoonFilled color="#009bf5" size={16} /> : <IconSunFilled color="orange" size={16} />}
    </ActionIcon>
  );
}

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

const auth = getAuth()

function App() {
  const [lists, setLists] = useState(() => {
    const storedLists = localStorage.getItem("lists");
    return storedLists ? JSON.parse(storedLists) : []
  })
  const [favorites, setFavorites] = useState(() => {
    const storedLists = localStorage.getItem("fav_lists");
    return storedLists ? JSON.parse(storedLists) : []
  })
  const [counter, setCounter] = useState(0)
  const [uploadBackUpCounter, setUploadBackUpCounter] = useState(0)
  const [warningCounter, setWarningCounter] = useState(0)
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [pageNo, setPageNo] = useState("")


  const [opened, { open, close }] = useDisclosure(false);
  const [openFav, { open: open_fav, close: close_fav }] = useDisclosure(false);
  const [openAuthentication, { open: open_auth, close: close_auth }] = useDisclosure(false);

  {/* Edit Quote */ }
  const [openEditModal, { open: open_edit, close: close_edit }] = useDisclosure(false);
  const [selectedList, setSelectedList] = useState(null)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editText, setEditText] = useState("")
  const [editPageNo, setEditPageNo] = useState("")


  {/* Title suggestion filter */ }
  const [debouncedSearch] = useDebouncedValue(title, 1000)
  const titles = lists.map((item) => item.title).filter((title) => title.toLowerCase().includes(debouncedSearch.toLocaleLowerCase()));

  { /* Spotlight filter */ }
  const clipboard = useClipboard({ timeout: 500 })
  const list_items = lists.flatMap((list) =>
    list.quotes.map((quote) => ({
      id: quote.id,
      label: quote.description,
      description: `${list.title}, p. ${quote.pageNo}`,
      onClick: () => handleSpotLight(quote.description),
    }))
  );


  { /* Drag n Drop */ }
  const [state, handlers] = useListState(lists)
  useEffect(() => {
    if (lists !== state) handlers.setState(lists);
  }, [lists]);

  { /* Retrieve Lists */ }
  useEffect(() => {
    localStorage.setItem("lists", JSON.stringify(state))
    setLists(state)
    {/*  if (!user && counter === 0){
      open_auth()
      setCounter(counter+1)
    } */}
    handleCloudUpload()
  }, [state])

  useEffect(() => {
    localStorage.setItem("fav_lists", JSON.stringify(favorites))
    handleCloudUpload()
  }, [favorites])

  {/* Theme */ }
  const [colorScheme, setColorScheme] = useState("light")

  {/* Affix */ }
  const [scroll, scrollTo] = useWindowScroll()

  {/* User details */ }
  const [user, setUser] = useState(null)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    return () => unsubscribe();
  }, [])

  {/* Cloud sync */ }
  const [loading, setLoading] = useState(null);
  useEffect(() => {
    if (user) {
      fetchCloudBackup()
      if (warningCounter === 0) {
        notifications.show({
          title: "Cloud Sync Enabled",
          message: "All changes made to your cloud account will automatically sync with your local storage. This allows seamless access to your data across devices.",
          autoClose: 5000,
          icon: <IconMessageExclamation size={16} />,
          color: "red",
        });
        setWarningCounter(warningCounter + 1)
      }
      if (uploadBackUpCounter === 0) {
        handleCloudUpload()
        setUploadBackUpCounter(uploadBackUpCounter + 1)
      }
    }
  }, [user])


  const handleLogout = async () => {
    await signOut(auth)
    setCounter(0)
    setWarningCounter(0)
    notifications.show({
      title: "Log out successfull",
      message: "You are now logged out!",
      autoClose: 2000,
      color: "teal"
    })
  }

  const handleAdd = () => {
    if (title.trim() === "" || text.trim() === "") return;

    const existingTitle = lists.find((list) => list.title.trim().toLowerCase() === title.trim().toLowerCase());

    if (existingTitle) {
      const updatedQuotes = [...existingTitle.quotes, { id: Date.now(), description: text, pageNo: pageNo || " N/A" }];
      const updatedLists = (lists.map((list) => (list.id === existingTitle.id ? { ...list, quotes: updatedQuotes } : list)))

      setLists(updatedLists)
      notifications.show({
        title: "Quote Added",
        message: "Your quote has been successfully added to the book.",
        autoClose: 2000,
        icon: <IconCheck size={16} />,
        color: "blue",
      });

    } else {
      const updatedLists = ([
        ...lists,
        {
          id: Date.now(),
          title: title,
          quotes: [{ id: Date.now(), description: text, pageNo: pageNo || " N/A" }],
        }
      ])

      setLists(updatedLists)
      notifications.show({
        title: "Book Added",
        message: "Your new book has been successfully added to the list!",
        autoClose: 2000,
        icon: <IconCheck size={16} />,
        color: "green",
      });
    }

    setText("")
    setPageNo("")
  }

  const handleAddQuote = () => {
    if (title.trim() !== '') {
      open();
    }
  };

  const handleAddQuoteAccordion = (title) => {
    setTitle(title)
    if (title.trim() !== '') {
      open();
    }
  };

  const handleEditQuote = (item, quote) => {
    setSelectedList(item)
    setSelectedQuote(quote)
    setEditTitle(item.title)
    setEditText(quote.description)
    setEditPageNo(quote.pageNo)
    open_edit()
  }

  const handleSaveQuote = () => {
    if (!selectedQuote) return;
    if (!selectedList) return;

    const updatedLists = lists.map((list) => (
      list.id === selectedList.id ? {
        ...list,
        title: editTitle.trim() ? editTitle : list.title,
        quotes: list.quotes.map((quote) =>
          quote.id === selectedQuote.id
            ? { ...quote, description: editText, pageNo: editPageNo || " N/A" }
            : quote
        ),
      } : list));

    const updatedFavorites = favorites.map((fav) =>
      fav.quoteId === selectedQuote.id ?
        {
          ...fav,
          title: editTitle.trim() ? editTitle : quote.title,
          quoteDescription: editText,
          pageNo: editPageNo || " N/A"
        }
        : fav
    )

    setLists(updatedLists)
    setFavorites(updatedFavorites)
    close_edit()

    notifications.show(
      {
        title: "Quote Updated",
        message: "Your quote has been successfully updated.",
        autoClose: 2000,
        icon: <IconPencilCheck size={16} />,
        color: "teal",
      }
    )
  }

  const handleOpenFavorite = () => {
    open_fav();
  };

  const handleAddFavorite = (quoteId, bookTitle, quoteDescription, quotePageNo) => {
    if (favorites.some((list) => list.quoteId === quoteId)) {
      return
    }

    try {
      const updatedLists = {
        id: Date.now(),
        title: bookTitle,
        quoteId: quoteId,
        quoteDescription: quoteDescription,
        pageNo: quotePageNo || " N/A",
      }
      setFavorites([...favorites, updatedLists])
      notifications.show({
        title: "Quote Added",
        message: "Quote has been successfully added to the favorite list!",
        autoClose: 2000,
        icon: <IconHeart size={16} />,
        color: "red",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Something went wrong. Please Try again",
        autoClose: 2000,
        icon: <IconX size={16} />,
        color: "red",
      });
    }
  }

  const toggleFavorite = (quoteId, bookTitle, quoteDescription, quotePageNo) => {
    const favoriteItem = favorites.find((item) => item.quoteId === quoteId);
    const isFav = Boolean(favoriteItem)
    const favId = favoriteItem ? favoriteItem.id : null;

    if (isFav) {
      handleDeleteFavorite(favId)
    } else {
      handleAddFavorite(quoteId, bookTitle, quoteDescription, quotePageNo)
    }
  }

  const openDeleteModalForBook = (id) =>
    modals.openConfirmModal({
      title: 'Remove Book from Collection',
      centered: true,
      children: (
        <Text size="sm" fw={500}>
          Are you sure you want to delete this book? <br />
        </Text>
      ),
      labels: { confirm: 'Delete book', cancel: "No, don't delete it" },
      confirmProps: { color: 'red' },
      onCancel: () => notifications.show({
        title: "Deletion canceled.",
        message: "Book deletion canceled. The book remains in your list.",
        autoClose: 2000,
      }),
      onConfirm: () => handleDeleteBook(id),
    });

  const handleDeleteBook = (id) => {
    try {
      let copyOfOldList = [...lists]
      const handleTrigger = () => {
        handleUndoDelete(copyOfOldList)
        copyOfOldList = null;
      }
      setLists((prevList) => prevList.filter((list) => list.id !== id));
      notifications.show({
        title: "Book Removed",
        message: "The selected book has been successfully deleted from your list.",
        autoClose: 2000,
        icon: <IconCheck size={16} />,
        color: "teal",
      });
      const toastId = toast.custom(
        <Button variant="default" onClick={() => { toast.remove(toastId); handleTrigger() }}>
          <IconArrowBackUp size={16} />
          <Space w="md" />
          Undo
        </Button>
      )
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Something went wrong. Please Try again",
        autoClose: 2000,
        icon: <IconX size={16} />,
        color: "red",
      });
    }
  }

  const handleUndoDelete = (oldList) => {
    if (oldList) {
      setLists(oldList)
    }
  }

  const openDeleteModalForQuote = (bookId, quoteId) =>
    modals.openConfirmModal({
      title: 'Remove quote from Collection',
      centered: true,
      children: (
        <Text size="sm" fw={500}>
          Are you sure you want to delete this quote? <br />
          There is no way to recover it once it's deleted.
        </Text>
      ),
      labels: { confirm: 'Delete quote', cancel: "No, don't delete it" },
      confirmProps: { color: 'red' },
      onCancel: () => notifications.show({
        title: "Deletion canceled.",
        message: "Quote deletion canceled. The quote remains in your book.",
        autoClose: 2000,
      }),
      onConfirm: () => handleDeleteQuote(bookId, quoteId),
    });

  const handleDeleteQuote = (bookId, quoteId) => {
    setLists((prevLists) => prevLists.map((list) =>
      list.id === bookId ? { ...list, quotes: list.quotes.filter((quote) => quote.id !== quoteId) } : list
    ))
    notifications.show({
      title: "Quote Removed",
      message: "The selected quote has been successfully deleted.",
      autoClose: 2000,
      icon: <IconCheck size={16} />,
      color: "teal",
    });
  }

  const handleDeleteFavorite = (id) => {
    setFavorites((prevList) => prevList.filter((list) => list.id !== id));
  }

  const handleSpotLight = (description) => {
    clipboard.copy(description);
    notifications.show({
      title: "Quote Copied!",
      message: "The quote has been copied to your clipboard.",
      autoClose: 2000,
      icon: <IconCopyCheck size={16} />,
    })
  }

  const handleCloudUpload = async () => {
    if (!user) return;
    setLoading(true)

    try {
      const userDocRef = doc(db, "users", user.uid);

      const dataToUpload = {
        lists,
        favorites,
        timestamp: new Date().toISOString(),
      }

      await setDoc(userDocRef, dataToUpload);
      setLoading(false)
      return;

    } catch (error) {
      notifications.show({
        title: "Upload Failed",
        message: "Something went wrong. Please try again.",
        autoClose: 3000,
        color: "red",
      });
    }
  }



  const fetchCloudBackup = async () => {
    if (!user) return;

    try {

      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data();

        const mergedLists = [
          ...lists,
          ...cloudData.lists.filter(cloudItem => !lists.some(localItem => localItem.id === cloudItem.id || localItem.title === cloudItem.title))
        ];

        const mergedFavorites = [
          ...favorites,
          ...cloudData.favorites.filter(cloudItem => !favorites.some(localItem => localItem.id === cloudItem.id || localItem.title || cloudItem.title))
        ];

        setLists(mergedLists);
        setFavorites(mergedFavorites);

      } else {
        notifications.show({
          title: "No Backup Found",
          message: "There is no backup available for your account.",
          autoClose: 3000,
          color: "blue",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Restore Failed",
        message: "Something went wrong. Please try again.",
        autoClose: 3000,
        color: "red",
      });
    }
  };



  {/* List mapping */ }
  const items = state.map((item, index) => (
    <Container size={"xl"} key={item.id}>
      <Accordion.Item key={item.id} value={item.title}>
        <Draggable key={item.id} index={index} type={item.id} draggableId={item.title}>
          {(provided, snapshot) => (
            <div
              className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Accordion.Control icon={
                  <ThemeIcon size={24} radius={"xl"} color="bronze" variant="light">
                    <IconQuotes size={16} />
                  </ThemeIcon>}>
                  <Title key={item.id} order={4} style={{ lineHeight: 1.2 }}>{item.title}</Title>
                </Accordion.Control>
                <ActionIcon
                  radius={"lg"}
                  size="lg"
                  color="red"
                  variant="light"
                  onClick={() => openDeleteModalForBook(item.id)}
                  style={{ marginLeft: "8px" }}
                >
                  <IconTrashFilled size={14} />
                </ActionIcon>
                <ActionIcon
                  radius={"lg"}
                  size="lg"
                  color="yellow"
                  variant="light"
                  onClick={() => { handleAddQuoteAccordion(item.title) }}
                  style={{ marginLeft: "8px" }}
                >
                  <IconCirclePlusFilled size={14} />
                </ActionIcon>
              </Box>
            </div>
          )}
        </Draggable>
        <Accordion.Panel>
          <List type="ordered" spacing="sm">
            {item.quotes.map((quote) => (
              <Card
                key={quote.id}
                withBorder shadow="lg"
                radius="lg"
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px"
                }}
              >
                <div>
                  <ThemeIcon size={16} radius={"xl"} color="teal" variant="light" style={{ marginRight: "4px" }}>
                    <IconQuoteFilled size={12} />
                  </ThemeIcon>
                  {/* Quote */}
                  <em>{quote.description} </em>
                  <span style={{ fontStyle: "italic", color: "#888" }}>
                    — p. {quote.pageNo}
                  </span>
                </div>

                <Divider my="xs" />
                {/* edit button */}
                <Flex align="center" justify="space-between" w="100%">
                  <ActionIcon variant="subtle" color="#706d6d" onClick={() => handleEditQuote(item, quote)}>
                    <IconEdit size={16} />
                  </ActionIcon>

                  {/* like button */}
                  <ActionIcon variant="subtle" color="#706d6d"
                    onClick={() => toggleFavorite(quote.id, item.title, quote.description, quote.pageNo)}>
                    {favorites.some((item) => item.quoteId === quote.id) ? <IconHeartFilled color="rgba(255, 0, 43, 0.7)" size={16} /> : <IconHeart size={16} />}
                  </ActionIcon>

                  {/* copy button} */}
                  <CopyButton value={quote.description} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : '#706d6d'} variant="subtle" onClick={copy}>
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>

                  {/* delete button */}
                  <ActionIcon variant="subtle" color="#706d6d" onClick={() => openDeleteModalForQuote(item.id, quote.id)} >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Flex>
              </Card>
            ))}
          </List>
        </Accordion.Panel>
      </Accordion.Item>
    </Container>
  ))

  return (
    <MantineProvider theme={{ ...theme, colorScheme }} defaultColorScheme={colorScheme} withGlobalStyles withNormalizeCSS>
      <ModalsProvider radius={"lg"}>
        <Space h="lg"></Space>
        <Text size="xl" fw={700} style={{ position: "relative", top: "0px", left: "10px", zIndex: 1000 }}>QuoteNest</Text>
        <Divider my="xs" variant="dotted" />

        <Space h="md"></Space>
        <Container size={"sm"}>
          <form>
            <Autocomplete
              radius={"md"}
              size={"md"}
              placeholder="Add Bookname here"
              value={title}
              data={titles}
              onChange={setTitle}
              required
              rightSection={title.length > 0 && <ActionIcon variant="transparent" radius={"xl"} color="gray" onClick={() => setTitle("")}> <IconX size={16} /> </ActionIcon>}
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
        <Drawer opened={opened} onClose={close} position="bottom" title="Enter description and page number">
          <Textarea
            radius={"md"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add description here"
            required />
          <Space h={"xs"} />
          <NumberInput
            radius={"md"}
            value={pageNo}
            onChange={setPageNo}
            placeholder="Add page number here (optional)"
          />
          <Space h="xs"></Space>
          <Center><Button onClick={handleAdd}>Save</Button></Center>
        </Drawer>
        <Space h="lg"></Space>
        <Center>
          <Title order={2}>Quotes</Title>
        </Center>
        <Space h="sm"></Space>
        <Card>
          <Accordion defaultValue={"Notes"}>
            {items.length > 0 ? (
              <Accordion>
                <DragDropContext
                  onDragEnd={({ destination, source }) =>
                    handlers.reorder({ from: source.index, to: destination?.index || null })
                  }
                >
                  <Droppable key={items.id} droppableId="dnd-list" direction="vertical">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {items}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Accordion>
            ) : (
              <Center><span>No quotes added yet. Start by adding a quote</span></Center>
            )}
          </Accordion>
        </Card>
        {favorites.length > 0 && (
          <div>
            <Space h="lg"></Space>
            <Center>
              <Button variant="default" onClick={handleOpenFavorite}>
                Open Favorites
              </Button>
            </Center>
          </div>
        )}
        <Drawer
          position="bottom"
          size={"lg"}
          opened={openFav}
          onClose={close_fav}
          transitionProps={{ transition: 'fade', duration: 200 }}
        >
          <Center><Drawer.Title><em>Favorites</em></Drawer.Title></Center>
          <Space h="lg"></Space>
          <List type="ordered" spacing="sm">
            {favorites.map((item) => (
              <Card key={item.id}
                withBorder shadow="sm"
                radius="lg"
                style={{ marginBottom: "10px" }}>
                <List.Item key={item.id}>
                  <Box>
                    <Menu withinPortal position="bottom-start" withArrow>
                      <Menu.Target>
                        <div>
                          <em>{item.quoteDescription} </em>
                          <span style={{ fontStyle: "italic", color: "#888" }}>
                            — {item.title}, p. {item.pageNo}
                          </span>
                        </div>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item onClick={() => handleDeleteFavorite(item.id)}>
                          Delete from favorites
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Box>
                </List.Item>
              </Card>
            ))}
          </List>
        </Drawer>
        <Drawer opened={openEditModal} onClose={close_edit} title="Enter description and page number" position="bottom">
          <Textarea
            radius={"md"}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Edit title here"
            required />
          <Space h={"xs"} />
          <Textarea
            radius={"md"}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Edit description here"
            required />
          <Space h={"xs"} />
          <NumberInput
            radius={"md"}
            value={editPageNo}
            onChange={setEditPageNo}
            placeholder="Edit page number here (optional)"
          />
          <Space h="xs"></Space>
          <Center><Button onClick={handleSaveQuote}>Save Changes</Button></Center>
        </Drawer>

        {/* User menu */}
        <Box style={{ position: "absolute", top: "15px", right: "10px", zIndex: 1000 }}>
          <Menu withinPortal position="bottom-start" withArrow>
            <Menu.Target>
              <Avatar
                variant="default"
                radius={"lg"}
                size={"md"}
              />
            </Menu.Target>
            <Menu.Dropdown>
              {user ? (
                <Menu.Item icon={<IconLogout size={16} />} onClick={handleLogout}>
                  Log out
                </Menu.Item>
              ) : (
                <Menu.Item icon={<IconLogin2 size={16} />} onClick={open_auth} disabled>
                  Sign In / Register
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Box>

        {/* Search Bar */}
        <Container>
          <ActionIcon variant="default" radius="xl" size={39} onClick={spotlight.open} style={{ position: "absolute", top: "14.5px", right: "100px", zIndex: 1000 }}>
            <IconSearch size={16} />
          </ActionIcon>

          {/* Cloud Backup */}
          {user && (
            < ActionIcon variant="default" radius="xl" size={39} style={{ position: "absolute", top: "14.5px", right: "145px", zIndex: 1000 }}
              onClick={handleCloudUpload}
              loading={loading}
              disabled
            >
              <IconCloudUp size={16} />
            </ActionIcon>
          )}

          <Spotlight
            actions={list_items}
            nothingFound="Nothing found..."
            highlightQuery
            scrollable
            maxHeight={350}
            searchProps={{
              leftSection: <IconSearch size={20} stroke={1.5} />,
              placeholder: 'Search...',
            }}
            radius={"lg"}
          />
        </Container>

        <ThemeSwitcher />

        <AuthenticationForm opened={openAuthentication} onClose={close_auth} />
        <Notifications position="top-right" zIndex={1000} radius={"lg"} />
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition="slide-up" mounted={scroll.y > 0}>
            {(transitionStyles) => (
              <Button
                leftSection={<IconArrowUp size={16} />}
                style={transitionStyles}
                onClick={() => scrollTo({ y: 0 })}
                color="gray"
              >
                Scroll to top
              </Button>
            )}
          </Transition>
        </Affix>
        <Toaster position="bottom-center" />
      </ModalsProvider>
    </MantineProvider >
  )
}

export default App
