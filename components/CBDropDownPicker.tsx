import React from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { View, Text } from 'react-native';

const CBDropDownPicker = ({title, items, value, setValue, open, setOpen, placeholder}) => {

    return (
        <View>
            <Text style={{fontSize: 20, color: '#434A3F', marginBottom: 8}}>
                {title}
            </Text>
            <DropDownPicker
                items={items}
                placeholder={placeholder}
                value={value}
                setValue={setValue}
                open={open}
                setOpen={setOpen}
                closeAfterSelecting={true}
                disableBorderRadius={true}
                style={{
                    borderColor: '#9C9C9C',
                    borderRadius: 0
                }}
                dropDownContainerStyle={{
                    borderColor: '#9C9C9C',
                    borderRadius: 0
                }}
                textStyle={{
                    fontSize: 15,
                    color: '#7d7d7d'
                }}
            />
        </View>
    )
}

export default CBDropDownPicker;