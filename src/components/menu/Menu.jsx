"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import styles from "./Menu.module.css"; // Import the CSS module
import HomeIcon from "@mui/icons-material/Home";
import PostAddIcon from "@mui/icons-material/PostAdd";
import ListIcon from "@mui/icons-material/List";
import PeopleIcon from "@mui/icons-material/People";

const Menu = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [activePage, setActivePage] = useState(""); // Initially set to an empty string

  useEffect(() => {
    // Get the pathname from the router and set the active page accordingly
    const path = window.location.pathname;
    if (path === "/") {
      setActivePage("home");
    } else if (path === "/post") {
      setActivePage("post");
    } else if (path === "/postlist") {
      setActivePage("postlist");
    } else if (path === "/users") {
      setActivePage("users");
    }
  }, []);

  const handlePageChange = (page) => {
    setActivePage(page);
    setMenuActive(false); // Close the menu after clicking a link
  };

  return (
    <div
      className={`${styles["menu-container"]} ${
        menuActive ? styles["active"] : ""
      }`}
    >
      <div className={styles["menu-links"]}>
        <Link href="/" passHref style={{ textDecoration: "none" }}>
          <div
            className={`${styles["menu-link"]} ${
              activePage === "home" ? styles["active"] : ""
            }`}
            onClick={() => handlePageChange("home")}
          >
            <HomeIcon className={styles["icon"]} />
            <span className={styles["menu-text"]}>Home</span>
          </div>
        </Link>
        <Link href="/post" passHref style={{ textDecoration: "none" }}>
          <div
            className={`${styles["menu-link"]} ${
              activePage === "post" ? styles["active"] : ""
            }`}
            onClick={() => handlePageChange("post")}
          >
            <PostAddIcon className={styles["icon"]} />
            <span className={styles["menu-text"]}>Post</span>
          </div>
        </Link>
        <Link href="/postlist" passHref style={{ textDecoration: "none" }}>
          <div
            className={`${styles["menu-link"]} ${
              activePage === "postlist" ? styles["active"] : ""
            }`}
            onClick={() => handlePageChange("postlist")}
          >
            <ListIcon className={styles["icon"]} />
            <span className={styles["menu-text"]}>Post List</span>
          </div>
        </Link>
        <Link href="/users" passHref style={{ textDecoration: "none" }}>
          <div
            className={`${styles["menu-link"]} ${
              activePage === "users" ? styles["active"] : ""
            }`}
            onClick={() => handlePageChange("users")}
          >
            <PeopleIcon className={styles["icon"]} />
            <span className={styles["menu-text"]}>Users</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Menu;
