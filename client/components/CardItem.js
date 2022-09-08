import React from 'react';
import styles from '../assets/styles';
import { Ionicons } from "@expo/vector-icons";

import { Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import Icon from './Icon';

const CardItem = ({
  actions,
  description,
  image,
  matches,
  name,
  onPressLeft,
  onPressRight,
  status,
  variant
}) => {
  // Custom styling
  const fullWidth = Dimensions.get('window').width;
  const imageStyle = [
    {
      borderRadius: 8,
      width: variant ? fullWidth / 2 - 30 : fullWidth - 80,
      height: variant ? 170 : 350,
      margin: variant ? 0 : 20
    }
  ];

  const nameStyle = [
    {
      paddingTop: variant ? 10 : 15,
      paddingBottom: variant ? 5 : 7,
      color: 'red',
      fontSize: variant ? 15 : 30
    }
  ];

  return (
    <View style={styles.containerCardItem}>



      {/* MATCHES */}
      {matches && (
        <View style={styles.matchesCardItem}>
          <Text style={styles.matchesTextCardItem}>
            <Ionicons name="heart" /> {matches} KM
          </Text>
        </View>
      )}

      {/* NAME */}
      <Text style={nameStyle}>{name}</Text>

      {/* DESCRIPTION */}
      {description && (
        <Text style={styles.descriptionCardItem}>{description}</Text>
      )}

      {/* STATUS */}
      {status && (
        <View style={styles.status}>
          <View style={status === 'Online' ? styles.online : styles.offline} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}

      {/* ACTIONS */}
      {actions && (
        <View style={styles.actionsCardItem}>


          <TouchableOpacity style={styles.button} onPress={() => onPressLeft()}>
            <Text style={styles.like}>
              
            <Ionicons name="create-outline" style={{ color :'#000000'	}} size={37}/>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => onPressRight()}
          >
            <Text style={styles.dislike}>
            <Ionicons name="trash" style={{ color :'red'	}} size={37}/>
            </Text>
          </TouchableOpacity>


        </View>
      )}
    </View>
  );
};

export default CardItem;
