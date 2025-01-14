import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View, ActivityIndicator, Image, Text } from 'react-native';
import { Divider, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { remove, size } from 'lodash';

import PickedIdea from '../../components/Idea/PickedIdea';
import TitleNavigationBar from '../../components/TitleNavigationBar';
import { getLikedIdeas } from '../../firebase/UserRepository';
import { likeIdea } from '../../firebase/IdeaRepository';

const LikedIdeas = ({navigation}) => {

    const [ideas, setIdeas] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState();

    const user = useSelector(state => state.user.currentUser);

    useEffect(() => {
        user && getIdeas(user.uid);
    }, [user]);

    const getIdeas = async (uid) => {
        if(uid){
            const ret = await getLikedIdeas(uid);
            setIdeas(ret || []);
        }
    }

    const dislikeIdea = async (ideaId) => {
        setLoading(true);
        try{
            setSelectedIdea(ideaId);
            await likeIdea({ideaId, uid: user.uid, isLike: false});
            remove(ideas, idea => idea.id === ideaId);
            setIdeas([...ideas]);
        }catch(ex){
            Sentry.captureException(`dislikeIdea: ${ex}`);
        }
        setLoading(false);
        setSelectedIdea();
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{backgroundColor: 'white', paddingHorizontal: 20, alignItems: 'center'}}>
                <TitleNavigationBar
                    title='찜 목록'
                    containerStyle={{paddingVertical: 8}}
                    onBackPress={() => navigation.pop()}
                />
            </View>
            <Divider />

            {
                size(ideas)===0 ?
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={require('assets/icons/favorite_border.png')}  style={{width: 84, height: 84}}/>             
                    <Text style={{textAlign: 'center', color: '#334F74', fontSize: 16, marginTop: 24}}>아직 등록한 찜이 없습니다</Text>
                </View>
                :
                <FlatList
                    data={ideas}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            style={{marginBottom: 20}}
                            onPress={() => navigation.navigate('Idea', {ideaId: item.id})}
                        >
                            <PickedIdea idea={item} />
                            <View style={{position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white'}}>
                                <TouchableOpacity
                                    style={{paddingVertical: 20, paddingHorizontal: 20}}
                                    onPress={() => dislikeIdea(item.id)}
                                    disabled={loading}
                                >
                                    {
                                        (loading && selectedIdea===item.id) ?
                                        <ActivityIndicator size='small' color='#787878' />
                                        :
                                        <Icon name='favorite' color='red' />
                                    }
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    style={{padding: 20}}
                    ListFooterComponent={() => <View style={{height: 100}} />}
                />
            }
        </SafeAreaView>
    )
}

export default LikedIdeas;