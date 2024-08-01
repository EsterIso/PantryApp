'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, useMediaQuery } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Switch from '@mui/material/Switch'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const isMobile = useMediaQuery('(max-width:600px)')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
    setFilteredInventory(inventoryList) // initialize filtered inventory
  }
  
  useEffect(() => {
    updateInventory()
  }, [])
  
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query === '') {
      setFilteredInventory(inventory)
    } else {
      setFilteredInventory(
        inventory.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        )
      )
    }
  }
  
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const toggleDarkMode = () => setDarkMode(!darkMode)

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#3F4659' : '#008282',
      },
      background: {
        default: darkMode ? '#121212' : '#ffffff',
        paper: darkMode ? '#1d1d1d' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={2}
        sx={{
          backgroundImage: `url(${darkMode ? '/image/background-dark.png' : '/image/background-light.png'})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center center',
        }}
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName)
                  setItemName('')
                  handleClose()
                }}
                sx={{
                  color: 'white',
                  backgroundColor: '#3F4659',
                  '&:hover': {
                    backgroundColor: '#B6D5EB',
                  },
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Box border={'1px solid #333'} width="800px">
          <Box
            width="100%"
            height="100px"
            bgcolor={'primary.main'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Typography variant={'h2'} color={'text.primary'} textAlign={'center'}>
              Inventory Items
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" padding={2}>
            <TextField
              id="search-field"
              label="Search"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Box>
          <Box width="100%" maxHeight="300px" overflow="auto">
            <Stack width="100%" spacing={2}>
              {filteredInventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="100%"
                  minHeight="15px"
                  display={'flex'}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                  bgcolor={'primary.main'}
                  paddingX={5}
                >
                  <Typography variant={'h3'} color={'text.primary'} textAlign={'center'}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant={'h3'} color={'text.primary'} textAlign={'center'}>
                    Quantity: {quantity}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={() => removeItem(name)}
                      sx={{
                        color: 'white',
                        backgroundColor: '#3F4659',
                        '&:hover': {
                          backgroundColor: '#B6D5EB',
                        },
                      }}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleEdit(name)}
                      sx={{
                        color: 'white',
                        backgroundColor: '#3F4659',
                        '&:hover': {
                          backgroundColor: '#B6D5EB',
                        },
                      }}
                    >
                      Edit
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            color: 'white',
            backgroundColor: '#3F4659',
            '&:hover': {
              backgroundColor: '#B6D5EB',
            },
          }}
        >
          Add New Item
        </Button>
        <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
          <Typography variant="body1" color="text.primary" mr={1}>
            Dark Mode
          </Typography>
          <Switch checked={darkMode} onChange={toggleDarkMode} />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
