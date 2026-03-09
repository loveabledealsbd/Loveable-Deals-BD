import { createSlice } from '@reduxjs/toolkit'


const ratingSlice = createSlice({
    name: 'rating',
    initialState: {
        ratings: [],
    },
    reducers: {
        setRatings: (state, action) => {
            state.ratings = action.payload
        },
        addRating: (state, action) => {
            state.ratings.push(action.payload)
        },
        clearRatings: (state) => {
            state.ratings = []
        },
    }
})

export const { setRatings, addRating, clearRatings } = ratingSlice.actions

export default ratingSlice.reducer