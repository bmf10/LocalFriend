import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Picker,
    ActivityIndicator,
    ToastAndroid,
    Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ImagePicker from "react-native-image-picker";
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database";
import storage from '@react-native-firebase/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'

class EditScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            image: "https://firebasestorage.googleapis.com/v0/b/localfriend-a477e.appspot.com/o/defa" +
                "ult.png?alt=media&token=793444f9-c055-42ef-a126-79e6a959fc39",
            user: '',
            loading: false,
            datepicker: false,
            name: '',
            phoneNumber: '',
            gender: '',
            about: '',
            date_of_birth: '',
        }
    }

    handlePicture = () => {
        const options = {
            title: "Select Image",
            storageOptions: {
                skipBackup: true,
                path: 'images'
            },
            quality: 1
        }
        ImagePicker.showImagePicker(options, (response) => {
            console.log(response);
            if (!response.didCancel) {
                ToastAndroid.showWithGravity("Please Wait...", ToastAndroid.LONG, ToastAndroid.CENTER)
                this.handleUpload(response.uri);
            }
        })
    }

    handleUpload = (image) => {
        const user = auth().currentUser;
        const filename = "image-" + new Date().getTime();
        try {
            storage()
                .ref('image/' + filename)
                .putFile(image)
                .on(storage.TaskEvent.STATE_CHANGED, snapshot => {
                    console.log(snapshot)
                    this.setState({ loading: true })
                    if (snapshot.state === storage.TaskState.SUCCESS) {
                        snapshot
                            .ref
                            .getDownloadURL()
                            .then(url => {
                                database()
                                    .ref('users')
                                    .child(user.uid)
                                    .update({ photoURL: url });

                                this.setState({ image: url, loading: false })
                            })
                        ToastAndroid.showWithGravity("Photo changed successfully...", ToastAndroid.LONG, ToastAndroid.CENTER)
                    }
                })
        } catch (error) {
            console.log(error)
        }

    }

    componentDidMount() {
        this.handleGetData()
    }

    handleGetData = () => {
        const user = auth().currentUser;
        database()
            .ref('users')
            .orderByChild('uid')
            .equalTo(user.uid)
            .once('child_added', (snapshot) => {
                this.setState({
                    user: snapshot.val(),
                    gender: snapshot.val().gender,
                    image: snapshot
                        .val()
                        .photoURL
                })
            });
    }

    handlePhoneNumber = () => {
        this.setState({ phoneNumber: "+62" })
    }

    onSave = () => {
        const { name, phoneNumber, gender, about, date_of_birth, user } = this.state;

        const data = {
            displayName: name || user.displayName,
            phoneNumber: phoneNumber || user.phoneNumber,
            gender: gender,
            about: about || user.about,
            dob: date_of_birth || user.dob
        }

        const userdata = auth().currentUser;

        database()
            .ref('users')
            .child(userdata.uid)
            .update(data);
        ToastAndroid.showWithGravity("Data changed successfully...", ToastAndroid.LONG, ToastAndroid.CENTER)
        this.props.navigation.goBack();
    }

    render() {
        const { user, datepicker } = this.state;
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            this
                                .props
                                .navigation
                                .goBack()
                        }}>
                        <Icon style={styles.closeBtn} name="times" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit Profile</Text>
                    <TouchableOpacity onPress={this.onSave} style={styles.profileEdit}>
                        <Icon style={styles.saveBtn} name="check" />
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    <Image
                        style={styles.image}
                        source={{
                            uri: this.state.image
                        }} />
                    {this.state.loading === true
                        ? <ActivityIndicator
                            animating={this.state.loading}
                            style={styles.loading}
                            size="large"
                            color="#18a4e0" />
                        : <TouchableOpacity onPress={this.handlePicture}>
                            <Text style={styles.imageText}>Change Photo Profile</Text>
                        </TouchableOpacity>}
                    <View style={styles.inputForm}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                            style={styles.inputData}
                            defaultValue={user.displayName} onChangeText={(text) => this.setState({ name: text })}
                            placeholder="Insert Your Name" />
                    </View>
                    <View style={styles.inputForm}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            defaultValue={this.state.phoneNumber}
                            onFocus={this.handlePhoneNumber}
                            value={user.phoneNumber
                                ? user.phoneNumber
                                : null}
                            onChangeText={(text) => this.setState({ phoneNumber: text })}
                            keyboardType="phone-pad"
                            dataDetectorTypes="phoneNumber"
                            style={styles.inputData}
                            placeholder="Insert Phone Number" />
                    </View>
                    <View style={styles.inputForm}>
                        <Text style={styles.inputLabel}>Gender</Text>
                        <Picker
                            style={styles.picker}
                            mode="dropdown"
                            onValueChange={(value, index) => {
                                this.setState({ gender: value })
                            }}
                            selectedValue={this.state.gender}>
                            <Picker.Item label="Not Mentioned" value="Not Mentioned" />
                            <Picker.Item label="Male" value="Male" />
                            <Picker.Item label="Female" value="Female" />
                        </Picker>
                    </View>
                    <View style={styles.inputForm}>
                        <Text style={styles.inputLabel}>About Me</Text>
                        <TextInput
                            onChangeText={(text) => this.setState({ about: text })}
                            multiline={true}
                            defaultValue={user.about}
                            style={styles.inputDataMulti}
                            placeholder="Insert About Me" />
                    </View>
                    <View style={styles.inputForm}>
                        <Text style={styles.inputLabel}>Date of birth</Text>
                        <TextInput
                            value={this.state.date_of_birth}
                            onFocus={() => {
                                this.setState({ datepicker: true });
                                Keyboard.dismiss
                            }}
                            placeholder="Insert Your Birthday"
                            style={styles.inputData} />
                    </View>
                </ScrollView>
                {datepicker && <DateTimePicker
                    mode="date"
                    display="calendar"
                    onChange={(event, date) => {
                        this.setState({ date_of_birth: moment(date).format("D MMMM YYYY"), datepicker: false })
                    }}
                    value={new Date()} />}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#faf8f0",
        flex: 1
    },
    header: {
        backgroundColor: "#043353",
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        flexDirection: 'row',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,

        elevation: 2,
    },
    title: {
        fontSize: 20,
        color: "#faf8f0",
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 15
    },
    closeBtn: {
        fontSize: 22,
        color: "#faf8f0",
        marginLeft: 15,
        marginRight: 15
    },
    saveBtn: {
        fontSize: 22,
        color: "#18a4e0",
        marginLeft: 15,
        marginRight: 15
    },
    image: {
        borderRadius: 150,
        height: 150,
        width: 150,
        borderWidth: 1,
        borderColor: "#043353",
        alignSelf: "center",
        marginTop: 30
    },
    imageText: {
        color: "#18a4e0",
        alignSelf: "center",
        marginTop: 10,
        fontSize: 16,
        marginBottom: 20
    },
    inputForm: {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 5,
        borderColor: "#043353",
        borderWidth: 1,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: "center"
    },
    inputLabel: {
        flex: 1,
        marginLeft: 20,
        fontSize: 16
    },
    inputData: {
        textAlign: "right",
        marginRight: 20,
        fontSize: 16,
        textDecorationLine: "underline"
    },
    picker: {
        height: 50,
        width: 130
    },
    inputDataMulti: {
        textAlign: "right",
        marginRight: 20,
        fontSize: 16,
        textDecorationLine: "underline",
        width: 200
    },
    loading: {
        marginTop: 10,
        marginBottom: 10
    }
})

export default (EditScreen);