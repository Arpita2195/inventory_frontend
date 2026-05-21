import { createContext, useContext, useState, useEffect } from 'react'
import { inventoryApi } from '../api'

const InventoryContext = createContext()

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadInventory = async () => {
    setLoading(true)
    try {
      const { data } = await inventoryApi.getAll()
      setItems(data)
    } catch (error) {
      console.error('Failed to load inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const refreshInventory = () => {
    loadInventory()
  }

  return (
    <InventoryContext.Provider value={{ items, loading, refreshInventory }}>
      {children}
    </InventoryContext.Provider>
  )
}

export const useInventory = () => useContext(InventoryContext)
