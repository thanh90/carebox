import React from 'react';
import { View } from 'react-native';
import { Divider } from 'react-native-elements';
import IdeaBody from './IdeaBody';
import NewIdeaHead from './NewIdeaHead';

const NewIdea = ({idea, containerStyle}) => {

    return (
        idea ? (<View
            style={[
                {width: '100%', borderRadius: 10, backgroundColor: 'white', padding: 20},
                containerStyle
            ]}
        >
            <NewIdeaHead owner={idea.owner}/>
            <Divider style={{marginVertical: 16}}/>
            <IdeaBody idea={idea}/>
        </View>)
        :
        null
    )
}

export default NewIdea;