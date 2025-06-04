# Online Video Archive (OVA)

Online Video Archive is a web application for browsing and managing video libraries over a local area network (LAN). The project uses a **Golang backend** and an **Angular frontend**, designed for fast, modular, and maintainable media library access.

![image](https://github.com/user-attachments/assets/bd403829-e89a-465e-a965-14b7a9e70477)

---

## Features

- **Explore:** Browse videos by categories, folders, or tags.
- **Folder-Based Navigation:** Automatically reflects the physical folder structure from disk.
- **Favorites:** Mark and quickly access favorite videos.
- **Collections:** Organize videos into custom user-defined collections.
- **User Authentication:** Secure login system using JWT-based authentication.
- **Metadata Management:** Automatically generates and caches video metadata.
- **Modular Architecture:**
  - Backend written in Go with structured services, handlers, and routing.
  - Frontend built with Angular using components and services.
- **REST API:** Clean, versioned API for frontend-backend communication.
- **Static Frontend Hosting:** Angular app is prebuilt and served via the Go backend.
