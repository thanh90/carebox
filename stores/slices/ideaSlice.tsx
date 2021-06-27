import { createSlice } from "@reduxjs/toolkit";
const ideaSlice = createSlice({
    name: 'comment',
    initialState: {
        ideaId: null,
        comments: null,
        selectedCommentId: null,
        subComments: null,
    },
    reducers: {
        setIdeaId(state, action){
            state.ideaId = action.payload;
        },
        setComments(state, action){
            state.comments = action.payload;
        },
        setSubComments(state, action){
            state.subComments = action.payload;
        },
    }
})

export const  { setIdeaId, setComments, setSubComments } = ideaSlice.actions;
export default ideaSlice.reducer;