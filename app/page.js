'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, useMediaQuery, CircularProgress, Snackbar } from '@mui/material'
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
import Alert from '@mui/material/Alert'

const modalStyle = (isMobile) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: isMobile ? '90%' : 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
})

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [removeAllOpen, setRemoveAllOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [editingItem, setEditingItem] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [loading, setLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const isMobile = useMediaQuery('(max-width:600px)')

  const updateInventory = async () => {
    setLoading(true)
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
      setFilteredInventory(inventoryList)
    } catch (error) {
      setSnackbarMessage('Error fetching inventory')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    updateInventory()
  }, [])
  
  const addItem = async (item) => {
    setLoading(true)
    try {
      const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase())
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        await setDoc(docRef, { quantity: quantity + 1 })
      } else {
        await setDoc(docRef, { quantity: 1 })
      }
      setSnackbarMessage('Item added successfully')
      setSnackbarOpen(true)
      await updateInventory()
    } catch (error) {
      setSnackbarMessage('Error adding item')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }
  
  const removeItem = async (item) => {
    setLoading(true)
    try {
      const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase())
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        if (quantity === 1) {
          await deleteDoc(docRef)
        } else {
          await setDoc(docRef, { quantity: quantity - 1 })
        }
        setSnackbarMessage('Item removed successfully')
        setSnackbarOpen(true)
      }
      await updateInventory()
    } catch (error) {
      setSnackbarMessage('Error removing item')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
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
  const handleEditOpen = (itemName) => {
    setEditingItem(itemName)
    setNewItemName(itemName)
    setEditOpen(true)
  }
  const handleEditClose = () => setEditOpen(false)
  const toggleDarkMode = () => setDarkMode(!darkMode)

  const handleEdit = async () => {
    setLoading(true)
    try {
      const oldDocRef = doc(collection(firestore, 'inventory'), editingItem.toLowerCase())
      const newDocRef = doc(collection(firestore, 'inventory'), newItemName.toLowerCase())
      const oldDocSnap = await getDoc(oldDocRef)
      const newDocSnap = await getDoc(newDocRef)

      if (oldDocSnap.exists()) {
        const { quantity } = oldDocSnap.data()

        if (newDocSnap.exists()) {
          const newQuantity = (await newDocSnap.data()).quantity
          await setDoc(newDocRef, { quantity: newQuantity + quantity })
        } else {
          await setDoc(newDocRef, { quantity })
        }
        await deleteDoc(oldDocRef)
        setSnackbarMessage('Item updated successfully')
        setSnackbarOpen(true)
      }
      await updateInventory()
    } catch (error) {
      setSnackbarMessage('Error updating item')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
      handleEditClose()
    }
  }

  const handleRemoveAllOpen = () => setRemoveAllOpen(true)
  const handleRemoveAllClose = () => setRemoveAllOpen(false)

  const handleRemoveAll = async () => {
    setLoading(true)
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      docs.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      setSnackbarMessage('All items removed successfully')
      setSnackbarOpen(true)
      await updateInventory()
    } catch (error) {
      setSnackbarMessage('Error removing all items')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
      handleRemoveAllClose()
    }
  }

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
        padding={isMobile ? 1 : 2}
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle(isMobile)}>
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

        <Modal
          open={editOpen}
          onClose={handleEditClose}
          aria-labelledby="modal-edit-title"
          aria-describedby="modal-edit-description"
        >
          <Box sx={modalStyle(isMobile)}>
            <Typography id="modal-edit-title" variant="h6" component="h2">
              Edit Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField
                id="outlined-basic"
                label="New Item Name"
                variant="outlined"
                fullWidth
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={handleEdit}
                sx={{
                  color: 'white',
                  backgroundColor: '#3F4659',
                  '&:hover': {
                    backgroundColor: '#B6D5EB',
                  },
                }}
              >
                Save
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Modal
          open={removeAllOpen}
          onClose={handleRemoveAllClose}
          aria-labelledby="modal-remove-all-title"
          aria-describedby="modal-remove-all-description"
        >
          <Box sx={modalStyle(isMobile)}>
            <Typography id="modal-remove-all-title" variant="h6" component="h2">
              Are you sure you want to remove all items?
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleRemoveAll}
                sx={{
                  color: 'white',
                  backgroundColor: '#FF4D4D',
                  '&:hover': {
                    backgroundColor: '#FF8C8C',
                  },
                }}
              >
                Remove All
              </Button>
              <Button
                variant="outlined"
                onClick={handleRemoveAllClose}
                sx={{
                  color: 'white',
                  backgroundColor: '#3F4659',
                  '&:hover': {
                    backgroundColor: '#B6D5EB',
                  },
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Box border={'1px solid #333'} width={isMobile ? '100%' : '800px'}>
          <Box
            width="100%"
            height={isMobile ? '80px' : '100px'}
            bgcolor={'primary.main'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Typography variant={isMobile ? 'h4' : 'h2'} color={'text.primary'} textAlign={'center'}>
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
              {loading ? (
                <CircularProgress color="primary" />
              ) : (
                filteredInventory.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    width="100%"
                    minHeight="15px"
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    bgcolor={'primary.main'}
                    paddingX={5}
                    borderRadius={1}
                    boxShadow={2}
                  >
                    <Typography variant={isMobile ? 'h5' : 'h3'} color={'text.primary'} textAlign={'center'}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant={isMobile ? 'h5' : 'h3'} color={'text.primary'} textAlign={'center'}>
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
                        onClick={() => handleEditOpen(name)}
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
                ))
              )}
            </Stack>
          </Box>
        </Box>

        <Button variant="contained" onClick={handleOpen}
          sx={{
            color: 'white',
            backgroundColor: '#3F4659',
            '&:hover': {
              backgroundColor: '#B6D5EB',
            },
          }}>
          Add New Item
        </Button>
        <Button variant="contained" onClick={handleRemoveAllOpen}
          sx={{
            color: 'white',
            backgroundColor: '#FF4D4D',
            '&:hover': {
              backgroundColor: '#FF8C8C',
            },
          }}>
          Remove All Items
        </Button>

        <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
          <Typography variant="body1" color="text.primary" mr={1}>
            Dark Mode
          </Typography>
          <Switch checked={darkMode} onChange={toggleDarkMode} />
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="info">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  )
}
