import React from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import NewIdeaHead from './Idea/NewIdeaHead';
import ContainedTag from './ContainedTag';
import OutlinedTag from './OutlinedTag';
import IdeaHeart from './Idea/IdeaHeart';
import IdeaRate from './Idea/IdeaRate';
import PickedIdea from './Idea/PickedIdea';
import NewIdea from './Idea/NewIdea';
import StepIndicator from './StepIndicator';
import CBDropDownPicker from './CBDropDownPicker';
import PhotoUploadButton from './PhotoUploadButton';
import UploadedPhoto from './UploadedPhoto';
import CBTextInput from './CBTextInput';
import Rating from './Rating';
import CommentRegistrationModal from '../modals/CommentRegistrationModal';
import IdeaDetailScreen from '../screens/IdeaDetailScreen';
import CommentInputModal from '../modals/CommentInputModal';
import Profile from './Profile';
import ProfileChange from './ProfileChange';
import IdeaImageAdd from './IdeaImageAdd';

storiesOf('IdeaHead', module)
.addDecorator((getStory) => <View style={{flex: 1, padding: 20}}>{getStory()}</View>)
.add('New', () => <NewIdeaHead />)
.add('Profile', () => <Profile />)
.add('Profile Change', () => <ProfileChange />)
.add('ContainedTag', () => <ContainedTag text='기계'/>)
.add('OutlinedTag', () => <OutlinedTag sign='P' text='용도의 전환'/>)
.add('Idea Heart', () => <IdeaHeart count={13} />)
.add('Idea Rate', () => <IdeaRate rate={4.5} count={123} />)
.add('PickedIdea', () => <PickedIdea />)
.add('NewIdea', () => <NewIdea />)
.add('Step Indicator', () => <StepIndicator step={3}/>)
.add('Drop Box Picker', () => <CBDropDownPicker open items={[
    { label:'병동', value:'병동' },
    { label:'중환자실', value:'중환자실' },
    { label:'수술실', value:'수술실' },
    { label:'검사실', value:'검사실' },
    { label:'외래', value:'외래' }
]}/>)
.add('Photo Upload Button', () => <PhotoUploadButton />)
.add('Uploaded Photo', () => <UploadedPhoto uri='https://scontent-ssn1-1.xx.fbcdn.net/v/t1.6435-9/36780761_1780160235386232_7123462079440224256_n.jpg?_nc_cat=106&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=88CvYZIrIckAX-acn_S&_nc_ht=scontent-ssn1-1.xx&oh=10750a9a852cbcd497208e704fa56e87&oe=60E0ED17'/>)
.add('CB Text Input', () => <CBTextInput title='*아이디어 코멘트를 남겨주세요.' placeholder='입력해 주새요.' maxLength={50} />)
.add('Rating', () => <Rating title='실용성' />)
.add('Comment Registration Modal', () => <CommentRegistrationModal />)
.add('Idea Detail Screen', () => <IdeaDetailScreen />)
.add('Comment Input Modal', () => <CommentInputModal />)
.add('Idea Image Add', () => <IdeaImageAdd />)

