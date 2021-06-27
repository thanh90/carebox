import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: null,
        userProfileData: null,
        ideas: null,
    },
    reducers: {
        setUser(state, action){
            state.currentUser = action.payload;
        },
        setUserProfileData(state, action){
            state.userProfileData = action.payload;
        },
        setIdeas(state, action){
            state.ideas = action.payload;
        },
        addIdea(state, action){
            state.ideas = [action.payload, ...state.ideas]
        }
    }
})

export const  { setUser, setUserProfileData, setIdeas, addIdea } = userSlice.actions;
export default userSlice.reducer;