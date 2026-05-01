import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, Button, FlatList, StyleSheet, Alert,
  ActivityIndicator, TouchableOpacity, Modal, SafeAreaView
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "./firebaseConfig";

export default function GroceryScreen() {
  const [budget, setBudget] = useState("5000");
  const [familySize, setFamilySize] = useState("3");
  const [dietType, setDietType] = useState("Normal");
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState([]);
  const [cart, setCart] = useState({});
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [apiStats, setApiStats] = useState({
    totalCost: "0",
    remaining: "0",
    usage: "0%"
  });

  const API_POST_URL = "https://ukzada-grocery.hf.space/gradio_api/call/generate_grocery_list";

  const getPriceNumber = (priceStr) => {
    if (!priceStr) return 0;
    const cleanPrice = String(priceStr).replace(/[^\d.]/g, "");
    return Math.round(parseFloat(cleanPrice)) || 0;
  };

  const cartTotal = useMemo(() => {
    return Object.keys(cart).reduce((sum, name) => {
      const item = resultData.find((i) => i.name === name);
      const price = getPriceNumber(item?.price);
      return sum + price * (cart[name] || 0);
    }, 0);
  }, [cart, resultData]);

  const apiTotalLimit = useMemo(() => getPriceNumber(apiStats.totalCost), [apiStats.totalCost]);
  const isBudgetFull = useMemo(
    () => cartTotal >= apiTotalLimit && apiTotalLimit > 0,
    [cartTotal, apiTotalLimit]
  );

  const updateCart = (item, delta) => {
    const itemPrice = getPriceNumber(item.price);
    const currentQty = cart[item.name] || 0;
    const newQty = currentQty + delta;
    if (newQty < 0) return;
    if (delta > 0 && cartTotal + itemPrice > apiTotalLimit) {
      Alert.alert("Budget Full!", "You have reached your budget limit.");
      return;
    }
    setCart((prev) => ({ ...prev, [item.name]: newQty }));
  };

  const parseJsonResponse = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      const totalCost = data.total_cost ?? 0;
      const budgetVal = Number(budget);
      const remaining = data.remaining ?? (budgetVal - totalCost);

      setApiStats({
        totalCost: `${totalCost.toFixed(2)} PKR`,
        remaining: `${remaining.toFixed(2)} PKR`,
        usage: `${((totalCost / budgetVal) * 100).toFixed(1)}%`,
      });

      // ✅ RESTRICTION FILTER APPLIED HERE
      return (data.purchased_items || [])
        .filter((item) => {
          const name = item.product.toLowerCase();
          const category = (item.category || "").toLowerCase();

          if (dietType === "Diabetic") {
            const forbidden = ["sugar", "sweet", "candy", "syrup", "dessert", "chocolate"];
            if (forbidden.some(word => name.includes(word))) return false;
          }

          if (dietType === "Vegetarian") {
            const forbidden = ["meat", "chicken", "beef", "mutton", "fish", "lamb", "steak", "pork"];
            if (forbidden.some(word => name.includes(word) || category.includes(word))) return false;
          }

          return true;
        })
        .map((item) => ({
          name: item.product,
          price: `${(item.price ?? 0).toFixed(2)} PKR`,
          category: item.category,
          score: item.recommendation_score,
        }));
    } catch (e) {
      console.error("JSON parse error:", e);
      return [];
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setCart({});
    setResultData([]);

    try {
      const postResponse = await fetch(API_POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [Number(budget), Number(familySize), dietType, false]
        }),
      });

      const postText = await postResponse.text();
      if (!postResponse.ok) throw new Error(`POST ${postResponse.status}: ${postText}`);

      const postJson = JSON.parse(postText);
      const eventId = postJson.event_id;
      if (!eventId) throw new Error("No event_id returned.");

      const getUrl = `https://ukzada-grocery.hf.space/gradio_api/call/generate_grocery_list/${eventId}`;
      const getResponse = await fetch(getUrl);
      if (!getResponse.ok) throw new Error("GET error");

      const rawText = await getResponse.text();
      let jsonOutput = null;
      const lines = rawText.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data:")) {
          const dataStr = trimmed.replace(/^data:\s*/, "").trim();
          if (dataStr.startsWith("[")) {
            const parsed = JSON.parse(dataStr);
            if (Array.isArray(parsed) && parsed.length >= 2 && parsed[1]) {
              jsonOutput = parsed[1];
              break;
            }
          }
        }
      }

      if (!jsonOutput) throw new Error("Could not extract JSON.");

      const cleanedItems = parseJsonResponse(jsonOutput);
      setResultData(cleanedItems);

      if (cleanedItems.length > 0) {
        await addDoc(collection(firestore, "grocery_recommendations"), {
          userBudget: Number(budget),
          familyMembers: Number(familySize),
          dietCategory: dietType,
          generatedItems: cleanedItems,
          apiStats: apiStats,
          timestamp: serverTimestamp(),
        });
        Alert.alert("✅ Success", `${cleanedItems.length} items generated and saved!`);
      } else {
        Alert.alert("⚠️ Notice", "No items matched your diet/budget.");
      }
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.floatingCart} onPress={() => setIsCartVisible(true)}>
        <Text style={{ fontSize: 28 }}>🛒</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {Object.values(cart).reduce((a, b) => a + b, 0)}
          </Text>
        </View>
      </TouchableOpacity>

      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.headerTitle}>AI Smart Grocery</Text>
            <View style={styles.inputBox}>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.smallLabel}>Budget (PKR)</Text>
                  <TextInput
                    style={styles.field}
                    keyboardType="numeric"
                    value={budget}
                    onChangeText={setBudget}
                  />
                </View>
                <View style={[styles.flex1, { marginLeft: 10 }]}>
                  <Text style={styles.smallLabel}>Family Size</Text>
                  <TextInput
                    style={styles.field}
                    keyboardType="numeric"
                    value={familySize}
                    onChangeText={setFamilySize}
                  />
                </View>
              </View>
              <View style={styles.pickerBox}>
                <Picker selectedValue={dietType} onValueChange={setDietType}>
                  <Picker.Item label="Normal" value="Normal" />
                  <Picker.Item label="Diabetic" value="Diabetic" />
                  <Picker.Item label="Keto" value="Keto" />
                  <Picker.Item label="Vegetarian" value="Vegetarian" />
                  <Picker.Item label="All" value="All" />
                </Picker>
              </View>
              <Button
                title={loading ? "Generating..." : "GENERATE UNIQUE LIST"}
                onPress={handleGenerate}
                disabled={loading}
                color="#556B2F"
              />
            </View>

            {resultData.length > 0 && (
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>📊 Budget Stats</Text>
                <View style={styles.statsRow}>
                  <Text>Total Budget:</Text>
                  <Text style={styles.bold}>{Number(budget).toFixed(2)} PKR</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text>Total Cost:</Text>
                  <Text style={[styles.bold, { color: "#d35400" }]}>{apiStats.totalCost}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text>Remaining:</Text>
                  <Text style={[styles.bold, { color: "#556B2F" }]}>{apiStats.remaining}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text>Budget Used:</Text>
                  <Text style={styles.bold}>{apiStats.usage}</Text>
                </View>
              </View>
            )}
            {loading && (
              <ActivityIndicator size="large" color="#556B2F" style={{ margin: 20 }} />
            )}
          </>
        }
        data={resultData}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => {
          const itemPriceNum = getPriceNumber(item.price);
          const disableAdd = isBudgetFull || (apiTotalLimit > 0 && cartTotal + itemPriceNum > apiTotalLimit);
          const qty = cart[item.name] || 0;

          return (
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() => updateCart(item, -1)}
                  style={[styles.btnSmall, qty === 0 && { backgroundColor: "#bdc3c7" }]}
                  disabled={qty === 0}
                >
                  <Text style={styles.btnTxt}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyTxt}>{qty}</Text>
                <TouchableOpacity
                  onPress={() => updateCart(item, 1)}
                  style={[styles.btnSmall, disableAdd && { backgroundColor: "#bdc3c7" }]}
                  disabled={disableAdd}
                >
                  <Text style={styles.btnTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Modal visible={isCartVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
          <Text style={styles.modalHeader}>🛍 My Cart Items</Text>
          <FlatList
            data={Object.entries(cart).filter(([_, qty]) => qty > 0)}
            keyExtractor={([name]) => name}
            renderItem={({ item: [name, qty] }) => (
              <View style={styles.cartRow}>
                <Text style={{ flex: 1, fontSize: 16 }}>{name}</Text>
                <Text style={{ fontWeight: "bold" }}>x{qty}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 40, color: "#aaa" }}>Cart is empty</Text>
            }
          />
          <View style={{ marginTop: 20 }}>
            <Text style={styles.modalTotal}>Cart Total: {cartTotal.toFixed(2)} PKR</Text>
            <Button title="Back To List" onPress={() => setIsCartVisible(false)} color="#556B2F" />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f6", padding: 15 },
  floatingCart: {
    position: "absolute", right: 20, top: 45, zIndex: 10,
    backgroundColor: "#fff", padding: 10, borderRadius: 35, elevation: 8,
  },
  badge: {
    position: "absolute", right: 0, top: 0, backgroundColor: "#556B2F",
    borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  headerTitle: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 15 },
  inputBox: {
    backgroundColor: "#fff", padding: 15, borderRadius: 20, elevation: 4, marginBottom: 15,
  },
  row: { flexDirection: "row" },
  flex1: { flex: 1 },
  smallLabel: { fontSize: 12, color: "#7f8c8d", marginBottom: 4 },
  field: { backgroundColor: "#f1f2f6", padding: 10, borderRadius: 10, marginBottom: 10 },
  pickerBox: { backgroundColor: "#f1f2f6", borderRadius: 10, marginBottom: 15 },
  statsCard: {
    backgroundColor: "#fff", padding: 15, borderRadius: 15, marginBottom: 15,
    borderLeftWidth: 8, borderLeftColor: "#556B2F", elevation: 3,
  },
  statsTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 2 },
  bold: { fontWeight: "bold" },
  itemRow: {
    backgroundColor: "#fff", padding: 15, borderRadius: 12, marginVertical: 5,
    flexDirection: "row", alignItems: "center",
    borderLeftWidth: 5, borderLeftColor: "#556B2F", elevation: 2,
  },
  itemName: { fontSize: 14, fontWeight: "bold" },
  itemPrice: { fontSize: 13, color: "#556B2F", fontWeight: "bold" },
  itemCategory: { fontSize: 11, color: "#999", marginTop: 2 },
  stepper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f1f2f6", borderRadius: 10, padding: 4,
  },
  btnSmall: {
    width: 35, height: 35, backgroundColor: "#556B2F",
    justifyContent: "center", alignItems: "center", borderRadius: 8,
  },
  btnTxt: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  qtyTxt: { marginHorizontal: 12, fontWeight: "bold" },
  modalHeader: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginVertical: 20 },
  cartRow: { flexDirection: "row", padding: 15, borderBottomWidth: 1, borderColor: "#eee" },
  modalTotal: {
    fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#556B2F",
  },
});