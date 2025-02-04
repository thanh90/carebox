import React from 'react';
import { View, Text } from 'react-native';
import { AirbnbRating } from 'react-native-elements';

const IdeaRate = ({rate, count, isDisabled, containerStyle}) => {

    return (
        <View
            style={[{
                flexDirection: 'row',
                alignItems: 'center'
            }, containerStyle]}
        >
            <AirbnbRating
                size={20}
                defaultRating={rate}
                fractions={1}
                showRating={false}
                starContainerStyle={{margin: 0, padding: 0}}
                isDisabled={isDisabled}
            />
            <Text style={{color: '#898989', marginLeft: 8}}>코멘트 {count}</Text>
        </View>
    )
}

export default IdeaRate;