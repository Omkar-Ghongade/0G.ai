// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * 0G Social — from plan.md
 * Posts: contentId (0G storage ref; content JSON has body + optional image). Caption on-chain; likes on-chain.
 * Image is uploaded to 0G with the post; only contentId is stored on-chain (no image hash in contract).
 */
contract ZeroGSocial {
    struct Post {
        address author;
        string contentId;
        string caption;
        uint256 createdAt;
    }

    mapping(uint256 => Post) public posts;
    uint256 public postCount;

    mapping(uint256 => mapping(address => bool)) public likes;
    mapping(uint256 => uint256) public likeCount;

    event PostCreated(uint256 indexed postId, address author, string contentId, uint256 createdAt);
    event Liked(uint256 indexed postId, address user);
    event Unliked(uint256 indexed postId, address user);

    /// @param contentId 0G root hash of post content (JSON: body, imageRootHash — image uploaded to 0G, not stored on-chain)
    /// @param caption Short caption (e.g. first 80 chars of body)
    function createPost(string calldata contentId, string calldata caption) external {
        postCount++;
        posts[postCount] = Post({
            author: msg.sender,
            contentId: contentId,
            caption: caption,
            createdAt: block.timestamp
        });
        emit PostCreated(postCount, msg.sender, contentId, block.timestamp);
    }

    function like(uint256 postId) external {
        require(postId > 0 && postId <= postCount, "invalid post");
        require(!likes[postId][msg.sender], "already liked");
        likes[postId][msg.sender] = true;
        likeCount[postId]++;
        emit Liked(postId, msg.sender);
    }

    function unlike(uint256 postId) external {
        require(postId > 0 && postId <= postCount, "invalid post");
        require(likes[postId][msg.sender], "not liked");
        likes[postId][msg.sender] = false;
        likeCount[postId]--;
        emit Unliked(postId, msg.sender);
    }
}
