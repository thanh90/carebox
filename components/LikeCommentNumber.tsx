import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';

const LikeCommentNumber = ({liked, likeNumber=0, commentNumber=0}) => {

    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name={liked ? 'favorite' : 'favorite-border'} color={liked?'#EB1616':'#9F9F9F'}/>
                    <Text style={{color: '#434A3F', marginLeft: 2}}>{likeNumber}</Text>
                </View>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 12}}>
                <Icon name='chat-bubble-outline' color='#9F9F9F'/>
                <Text style={{color: '#434A3F', marginLeft: 2}}>{commentNumber}</Text>
            </View>
        </View>
    )
}

export default LikeCommentNumber;