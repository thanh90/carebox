import React from 'react';
import { View, FlatList, TouchableOpacity, Linking, Text } from 'react-native';
import Profile from 'components/Profile';
import { Icon } from 'react-native-elements';

const PickedUser = ({user, showContact}) => (
    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Profile user={user} avatarType='circle'/>
        {
            showContact &&
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                    style={{
                        padding: 8,
                        marginRight: 8
                    }}
                    onPress={() => Linking.openURL(`sms:${user.phoneNumber}`)}
                >
                    <Icon
                        type='material-community'
                        name='chat-processing-outline'
                        color='#4A7CFF'
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        padding: 8,
                    }}
                    onPress={() => Linking.openURL(`tel:${user.phoneNumber}`)}
                >
                    <Icon
                        type='material-community'
                        name='phone'
                        color='#4A7CFF'
                    />
                </TouchableOpacity>
            </View>
        }
    </View>
)

const PickedList = ({showContact, picks}) => {

    if(!picks) return null;

    return (
        <View style={{padding: 20}}>

            <FlatList
                data={picks}
                renderItem={({item}) => (<Profile user={item} avatarType='circle'/>)}
                keyExtractor={item=>item.uid}
                ItemSeparatorComponent={() => (<View style={{height: 16}} />)}
            />

        </View>
    )
}

export default PickedList;