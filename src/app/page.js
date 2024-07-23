"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { db } from "../utils/next.config";
import { collection, query, onSnapshot, where } from "firebase/firestore";

// Create an Axios instance
const apiClient = axios.create();

// Function to get access token
const getAccessToken = async () => {
  try {
    const response = await axios.get("/api/token");
    console.log("Access token retrieved:", response.data.accessToken); // Debugging line
    return response.data.accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const accessToken = await getAccessToken();
      if (accessToken) {
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        console.log("Retrying original request with new access token"); // Debugging line
        return apiClient(originalRequest);
      }
    }
    console.error("Interceptor error:", error); // Debugging line
    return Promise.reject(error);
  }
);

const Home = () => {
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [expoPushTokens, setExpoPushTokens] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "Users"),
      where("language", "==", selectedLanguage)
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const tokens = [];
      const userData = [];
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.expoPushToken) {
          tokens.push(user.expoPushToken);
          userData.push(user);
        }
      });
      setExpoPushTokens(tokens);
      setUsers(userData);
    });

    return () => {
      unsub();
    };
  }, [selectedLanguage]);

  const sendNotifications = async () => {
    if (!notificationTitle || !notificationMessage) {
      alert("Please enter notification title and message.");
      return;
    }
    if (users.length === 0 || expoPushTokens.length === 0) {
      alert("No users to send notifications to.");
      return;
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.error("Failed to obtain access token");
        return;
      }

      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
      console.log("Access token set in headers:", accessToken); // Debugging line

      const notificationMessageLimit =
        notificationMessage
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, "")
          .substring(0, 190 - (notificationMessage.length > 109 ? 3 : 0)) +
        (notificationMessage.length > 109 ? "..." : "");

      const notifications = expoPushTokens.map((token) => {
        const notification = {
          title: notificationTitle,
          body: notificationMessageLimit,
        };

        const fcmMessage = {
          token: token,
          notification,
        };

        return apiClient.post(
          "https://fcm.googleapis.com/v1/projects/assent-connect-plus-3014e/messages:send",
          { message: fcmMessage }
        );
      });

      const responses = await Promise.all(notifications);
      responses.forEach((response) => console.log(response.data));

      setNotificationTitle("");
      setNotificationMessage("");
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  return (
    <div style={{ width: "95%", padding: "20px" }}>
      <h2>Notifications</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Notification Title"
              fullWidth
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notification Message"
              fullWidth
              multiline
              rows={4}
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Select Language</InputLabel>
              <Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                label="Select Language"
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="हिंदी">हिंदी</MenuItem>
                <MenuItem value="বাংলা">বাংলা</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={sendNotifications}
          style={{ marginTop: "20px" }}
        >
          Send Notifications
        </Button>
      </div>
    </div>
  );
};

export default Home;
