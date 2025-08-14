A **space** (also referred to as a **directory**) is a **dynamic entity** that is **saved on the disk**. Each space represents a folder, and these spaces can contain sub-folders or **child spaces**.

#### **Space Identification**
Each space is assigned a **unique ID**, which is a **hash** that combines the **username of the owner** and the **space name**. This ensures that every space has a distinct identifier.

#### **Space Structure**
- **Folder Representation**: Each folder on the system is treated as a space. These folders can be **nested**, allowing spaces to contain subspaces.
- **Default Settings**: By default, every folder follows the default **space settings**, ensuring consistency in how spaces are treated.
#### **Owner and Permissions**
- **Owner Definition**: Every space has an **owner**. The **owner** is the user who has full control over the space, including the ability to edit, upload, and manage its contents.
    - The **default owner** for a space is the **admin**, who has access to all spaces and resources.
    - If a user is the **owner of a space**, they have the ability to:
        - **Edit** the space’s content
        - **Upload** new content to the space
        - **Read** the content of the space
        - **Invite others** to collaborate on the space
- **Admin Privileges**: The **admin** has access to all spaces and has **full control** over space visibility and permissions.

#### **Visibility and Access Control**
- **Child Spaces**: Sub-spaces (or child spaces) inherit the **visibility settings** of the **root space**. If the root space is public, child spaces are also public by default, unless specified otherwise.
- **Public Spaces**:
    - When a space is set to **public**, it is visible to **all users** on the platform.
- **Private Spaces**:
    - When a space is set to **private**, it is not visible to others by default. Access can only be granted through **private invite links**, ensuring controlled access.

#### **Latest Section & Video Visibility**
- **Latest Videos**:
    - The **Latest** section displays **new spaces** and **new videos** uploaded to the system.
    - Some videos may need to remain **private** or hidden from the **Latest** section, even if the space itself is public. This allows for flexibility in controlling the visibility of content.