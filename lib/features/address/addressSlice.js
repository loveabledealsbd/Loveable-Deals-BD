import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
    },
    reducers: {
        setAddresses: (state, action) => {
            state.list = action.payload
        },
        addAddress: (state, action) => {
            state.list.push(action.payload)
        },
        clearAddresses: (state) => {
            state.list = []
        },
    }
})

export const { setAddresses, addAddress, clearAddresses } = addressSlice.actions

export default addressSlice.reducer