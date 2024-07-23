"use client";

import React, { useEffect, useState } from "react";
import { db, storage } from "../../utils/next.config";
import { DataGrid } from "@mui/x-data-grid";
import {
  query,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  collection,
  getDoc,
  getDocs,
  orderBy,
} from "firebase/firestore";

import { deleteObject, ref } from "firebase/storage";
import {
  Modal,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility"; // Import the eye icon

import styles from "./page.module.css";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [openModal, setOpenModal] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedImage, setEditedImage] = useState("");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewedPost, setPreviewedPost] = useState(null);

  const [selectedPostIds, setSelectedPostIds] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, selectedLanguage),
      orderBy("timestamp", "desc") // Order by timestamp in descending order
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });

    return () => unsub();
  }, [selectedLanguage]);
  const toggleSelectPost = (postId) => {
    if (selectedPostIds.includes(postId)) {
      setSelectedPostIds(selectedPostIds.filter((id) => id !== postId));
    } else {
      setSelectedPostIds([...selectedPostIds, postId]);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const postId of selectedPostIds) {
        const postRef = doc(db, selectedLanguage, postId);
        const postSnapshot = await getDoc(postRef);
        const postData = postSnapshot.data();

        if (postData.imageUrl && postData.imageUrl !== "") {
          const imagePath = postData.imageUrl;
          const postImageRef = ref(storage, imagePath);

          try {
            await deleteObject(postImageRef);
          } catch (error) {
            console.error("Error deleting image from Firebase Storage:", error);
          }
        }

        await deleteDoc(doc(db, selectedLanguage, postId));
      }

      setSelectedPostIds([]);

      const q = query(collection(db, selectedLanguage));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);

      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting posts:", error);
    }
  };

  const handleEditPost = (post) => {
    setSelectedPostId(post.id);
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setEditedImage(post.imageUrl);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setEditedTitle("");
    setEditedContent("");
    setEditedImage("");
    setSelectedPostId("");
    setOpenModal(false);
  };

  const handleUpdatePost = async () => {
    try {
      if (!selectedPostId) {
        alert("No selected post ID to update.");
        return;
      }

      if (!editedTitle || !editedContent) {
        alert("Title and content must not be empty.");
        return;
      }

      const postRef = doc(db, selectedLanguage, selectedPostId);
      const postSnapshot = await getDoc(postRef);

      if (!postSnapshot.exists()) {
        console.error(`Document with ID ${selectedPostId} not found.`);
        return;
      }

      const dataToUpdate = {
        title: editedTitle,
        content: editedContent,
        imageUrl: editedImage,
      };

      await updateDoc(postRef, dataToUpdate);
      console.log("Post updated successfully");
      handleModalClose();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const togglePostStatus = async (postId, isDisabled) => {
    try {
      const postRef = doc(db, selectedLanguage, postId);
      const postSnapshot = await getDoc(postRef);
      const postData = postSnapshot.data();

      if (!postSnapshot.exists()) {
        console.error(`Document with ID ${postId} not found.`);
        return;
      }

      // Update the isDisabled field in Firestore
      await updateDoc(postRef, {
        isDisabled: !isDisabled, // Toggle the status
      });

      const q = query(collection(db, selectedLanguage));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };
  const handlePreview = (post) => {
    setPreviewedPost(post);
    setPreviewModalOpen(true);
  };

  const columns = [
    {
      field: "select",
      headerName: "Select",
      width: 100,
      renderCell: (params) => (
        <Checkbox
          checked={selectedPostIds.includes(params.row.id)}
          onChange={() => toggleSelectPost(params.row.id)}
        />
      ),
    },
    { field: "title", headerName: "Title", width: 200 },
    { field: "content", headerName: "Content", width: 200 },
    { field: "imageUrl", headerName: "Image URL", width: 200 },

    {
      field: "timestamp",
      headerName: "Timestamp",
      width: 200,
      valueFormatter: (params) => {
        const date = new Date(params.value.seconds * 1000);
        return date.toISOString();
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEditPost(params.row)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handlePreview(params.row)} size="small">
            <VisibilityIcon />
          </IconButton>
        </>
      ),
    },
    {
      field: "isDisabled",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Checkbox
          checked={!params.value} // Invert the status for the checkbox
          onChange={() => togglePostStatus(params.row.id, params.value)}
        />
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <h2>Post List</h2>
      <div className={styles.gridContainer}>
        <div>
          <FormControl
            className={styles.languageSelector}
            size="small"
            variant="outlined"
          >
            <InputLabel className={styles.inputLabel}>Language</InputLabel>
            <Select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="हिंदी">हिंदी</MenuItem>
              <MenuItem value="বাংলা">বাংলা</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            InputProps={{
              endAdornment: <SearchIcon className={styles.searchIcon} />,
            }}
          />
        </div>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteConfirmOpen(true)}
          disabled={selectedPostIds.length === 0}
        >
          Delete Selected
        </Button>
      </div>
      <DataGrid
        rows={posts}
        className={styles.dataGrid}
        columns={columns}
        scrollbarSize={5}
      />
      <Modal
        open={openModal}
        onClose={handleModalClose}
        className={styles.modal}
      >
        <div className={styles.modalContent}>
          <h3>Edit Post</h3>
          <TextField
            label="Title"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Content"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            required
            fullWidth
            margin="dense"
            multiline
            rows={4}
          />
          <TextField
            label="Image URL"
            value={editedImage}
            onChange={(e) => setEditedImage(e.target.value)}
            fullWidth
            margin="dense"
          />
          <Button
            onClick={handleUpdatePost}
            variant="contained"
            color="primary"
          >
            Update Post
          </Button>
        </div>
      </Modal>
      <Dialog
        open={Boolean(deleteConfirmOpen)}
        onClose={() => setDeleteConfirmOpen(false)}
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the selected posts?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSelected} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        fullWidth
      >
        <DialogTitle>Post Preview</DialogTitle>
        <DialogContent>
          {previewedPost && (
            <div>
              <h3>{previewedPost.title}</h3>
              <div
                dangerouslySetInnerHTML={{ __html: previewedPost.content }}
              />
              {previewedPost.imageUrl && previewedPost.imageUrl !== "" && (
                <div>
                  {previewedPost.imageUrl.includes(".mp4") ? (
                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                      {/* 16:9 aspect ratio container */}
                      <video
                        controls
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <source src={previewedPost.imageUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <img
                      src={previewedPost.imageUrl}
                      alt="Post Preview"
                      style={{ maxWidth: "100%" }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewModalOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Posts;
