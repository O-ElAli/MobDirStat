// import React from 'react';
// import { View, Text, Modal, Pressable, Image, StyleSheet } from 'react-native';

// const formatStorageSize = (size) => {
//   const numericSize = parseFloat(size); // Ensure it's a number
//   if (numericSize >= 1024) {
//     return { value: (numericSize / 1024).toFixed(1), unit: "GB" }; // GB with 1 decimal place
//   }
//   return { value: numericSize.toFixed(2), unit: "MB" }; // MB with 2 decimal places
// };



// const AppDetailsModal = ({ visible, app, onClose }) => {
//   if (!app) return null;

//   const formattedSize = formatStorageSize(parseFloat(app.size));

//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
//       <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//           {app.icon ? (
//             <Image source={{ uri: app.icon }} style={styles.appIcon} />
//           ) : (
//             <View style={styles.placeholderIcon} />
//           )}
//           <Text style={styles.appName}>{app.name}</Text>
//           <Text style={styles.appDetails}>
//             {app.name === "Filesystem" || app.name === "System"
//               ? `Total Storage Used: ${formattedSize.value} ${formattedSize.unit}`
//               : `Size: ${formattedSize.value} ${formattedSize.unit} {"\n"} Space Taken: ${
//                   isFinite(parseFloat(app.percentage)) ? parseFloat(app.percentage) : "0"
//                   }%`}
//           </Text>
//           <Pressable style={styles.closeButton} onPress={onClose}>
//             <Text style={styles.closeText}>Close</Text>
//           </Pressable>
//         </View>
//       </View>
//     </Modal>
//   );
// };


// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.6)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 10,
//     alignItems: "center",
//     width: 250,
//   },
//   appIcon: {
//     width: 60,
//     height: 60,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   placeholderIcon: {
//     width: 60,
//     height: 60,
//     borderRadius: 10,
//     backgroundColor: "#ccc",
//     marginBottom: 10,
//   },
//   appName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   appDetails: {
//     fontSize: 14,
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   closeButton: {
//     backgroundColor: "#6200EE",
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   closeText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
// });

// export default AppDetailsModal;