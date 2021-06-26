import React, { useState, useEffect } from 'react';
import { View, Image, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import IdeaOverallRating from '../components/IdeaOverallRating';
import NewIdeaHead from '../components/Idea/NewIdeaHead';
import OutlinedTag from '../components/OutlinedTag';
import ExpandableText from '../components/ExpandableText';
import RatingView from '../components/RatingView';
import LikeCommentNumber from 'components/LikeCommentNumber';
import { Divider } from 'react-native-elements';
import CommentInputModal from '../modals/CommentInputModal';
import { useDispatch, useSelector } from 'react-redux';
import { map } from 'lodash';
import { addIdeaCommentsListenner } from '../firebase/IdeaRepository';

const Comment = ({comment, showCommentInput}) => {

    const {
        ideaId, practicalityRate, creativityRate, valuableRate,
        scamper, content, links
    } = comment;

    const scamperSplits = scamper.split(' : ');

    console.log(comment);

    return (<View>
        <View style={{marginBottom: 10}}>
            <Text style={{fontWeight: 'bold', fontSize: 16, color: '#434A3F', marginBottom: 8}}>종합평점 <Text style={{fontWeight: 'bold', fontSize: 16, color: '#1379FF'}}>2.8점</Text></Text>
            <RatingView {...{practicalityRate, creativityRate, valuableRate}}/>
        </View>
        <View style={{marginBottom: 10}}>
            <OutlinedTag
                sign={scamperSplits[0]}
                text={scamperSplits[1]}
                style={{alignSelf: 'flex-start'}}
            />
        </View>
        <View style={{marginBottom: 10}}>
            <ExpandableText text={content}/>
        </View>
        <Image style={{height: 150, marginBottom: 20}} source={{uri: 'https://st.depositphotos.com/1428083/2946/i/600/depositphotos_29460297-stock-photo-bird-cage.jpg'}} />
        
        <View style={{marginBottom: 32}}>
            {
                map(links, link => (
                    <View style={{marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={{color: '#334F74', fontSize: 16}}>&#8226; {link.externalLinkTitle}</Text>
                        <Text style={{color: '#2E2E2E'}} numberOfLines={1}>{link.externalLink}</Text>
                    </View>
                ))
            }
        </View>

        <View style={{marginBottom: 10}}>
            <LikeCommentNumber liked={true}/>
        </View>
        
        <Divider/>

        <TouchableOpacity style={{paddingVertical: 10}}>
            <Text style={{fontSize: 10, color: '#898989'}}>댓글 20개 모두 보기</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={{
                flexDirection: 'row',
                width: '100%',
                backgroundColor: 'white',
                paddingVertical: 16,
                alignItems: 'center'
            }}
            onPress={showCommentInput}
        >
            <Image source={require('assets/icons/person.png')} />
            <View pointerEvents='none'>
                <TextInput 
                    style={{flex: 1, color: '#898989', marginLeft: 8}}
                    placeholder='댓글 달기...'
                    editable={false}
                    rejectResponderTermination={true}
                />
            </View>
        </TouchableOpacity>
    </View>
)}

const IdeaCommentScreen = ({idea}) => {
    const [ showCommentInputModal, setShowCommentInputModal ] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const unsubcriber = addIdeaCommentsListenner(idea.id, dispatch);

        return () => typeof unsubcriber === 'function' && unsubcriber();
    }, []);

    const comments = useSelector(state => state.idea.comments)

    return (
        <ScrollView>
            <IdeaOverallRating />
            {
                map(comments, comment => (
                    <>
                        <View style={{padding: 20}}>
                            <View style={{paddingBottom: 20}}>
                                <NewIdeaHead />
                            </View>

                            <Comment
                                comment={comment}
                                showCommentInput={() => setShowCommentInputModal(true)}
                            />
                        </View>
                        {
                            showCommentInputModal &&
                            <CommentInputModal
                                onClose={() => setShowCommentInputModal(false)}
                            />
                        }
                    </>
                ))
            }
        </ScrollView>
    )
}

export default IdeaCommentScreen;