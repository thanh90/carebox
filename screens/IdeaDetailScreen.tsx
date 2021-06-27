import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import PickedIdea from '../components/Idea/PickedIdea';
import { Divider, Icon } from 'react-native-elements';
import { map, includes, size } from 'lodash';
import IdeaCommentButtons from '../components/IdeaCommentButtons';
import CommentRegistrationModal from '../modals/CommentRegistrationModal';
import { useDispatch, useSelector } from 'react-redux';
import { likeIdea, addIdeaListenner } from '../firebase/IdeaRepository';

const IdeaDetailScreen = ({idea}) => {
    if(!idea) return null;

    const dispatch = useDispatch();

    useEffect(() => {
        if(idea.id){
            const unsubscriber = addIdeaListenner(idea.id, dispatch);

            return (typeof unsubscriber === 'function') && unsubscriber();
        }
    }, [idea])

    console.log('likes', idea.likes);

    const user = useSelector(state => state.user.currentUser);
    const currentIdea = useSelector(state => state.idea.currentIdea)

    const { id, detail, images } = idea;

    const [ showingCommentRegistrationModal, setShowingCommentRegistrationModal ] = useState(false);

    return (
        <View
            style={{flex: 1, backgroundColor: 'white'}}
        >
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
                <PickedIdea idea={currentIdea || idea}/>
                <Divider/>
                <View style={{padding: 20}}>
                    <View style={{marginBottom: 8}}>
                        <Text style={{color: '#898989', marginBottom: 2}}>구체적 대상</Text>
                        <Text style={{color: '#334F74', fontSize: 16}}>{detail.object}</Text>
                    </View>
                    <View style={{marginBottom: 8}}>
                        <Text style={{color: '#898989', marginBottom: 2}}>구체적 상황</Text>
                        <Text style={{color: '#334F74', fontSize: 16}}>{detail.situation}</Text>
                    </View>
                    <View style={{marginBottom: 8}}>
                        <Text style={{color: '#898989', marginBottom: 2}}>해결방법</Text>
                        <Text style={{color: '#334F74', fontSize: 16}}>{detail.solution}</Text>
                    </View>
                </View>
                <Divider />
                <View style={{padding: 20}}>
                    <Text style={{color: '#7D7D7D', marginBottom: 8}}>이미지</Text>
                    {
                        map(images, ({title, url}) => (<>
                            <Image style={{height: 150, marginBottom: 8}} source={{uri: url}} />
                            <Text  style={{color: '#334F74', fontSize: 16}}>{title}</Text>
                        </>))
                    }
                </View>
                <Divider />
                <View style={{padding: 20, marginBottom: 120}}>
                    <Text style={{color: '#7D7D7D', marginBottom: 8}}>링크</Text>
                    <Text style={{color: '#334F74', fontSize: 16, lineHeight: 20}}>
                        1회용 필터 정보
                    </Text>
                    <Text style={{color: '#334F74', fontSize: 16, lineHeight: 20}}>
                        산소마스크 협회협회...
                    </Text>
                </View>
            </ScrollView>
            <View
                style={{
                    position: 'absolute',
                    bottom: 0, left: 0,
                    paddingVertical: 8,
                    width: '100%',
                    backgroundColor: 'white',
                    alignItems: 'center'
                }}
            >
                <IdeaCommentButtons
                    onCommentRegister={() => setShowingCommentRegistrationModal(true)}
                    onFavorite={() => likeIdea({ideaId: id, uid: user.uid, isLike: !includes((currentIdea||idea).likes, user.uid)})}
                    liked={includes((currentIdea||idea).likes, user.uid)}
                />
            </View>
            {
                showingCommentRegistrationModal &&
                <CommentRegistrationModal
                    ideaId={idea.id}
                    ownerId={idea.ownerId}
                    onClose={() => setShowingCommentRegistrationModal(false)}
                />
            }
        </View>
    )
}

export default IdeaDetailScreen;