#!/usr/bin/env node

/**
 * Generate Members List
 * 
 * This script automatically generates a list of all members
 * from the members/ directory and updates the README.md file.
 * 
 * Usage: node scripts/generate-members-list.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MEMBERS_DIR = path.join(__dirname, '..', 'members');
const README_PATH = path.join(__dirname, '..', 'README.md');
const MEMBER_LIST_MARKER_START = '<!-- MEMBERS_LIST_START -->';
const MEMBER_LIST_MARKER_END = '<!-- MEMBERS_LIST_END -->';

/**
 * Parse a member profile markdown file
 * @param {string} filename - The profile filename
 * @returns {Object|null} Member information or null if parsing fails
 */
function parseMemberProfile(filename) {
  const filepath = path.join(MEMBERS_DIR, filename);
  
  // Skip example profile
  if (filename === 'example-profile.md') {
    return null;
  }
  
  // Only process .md files
  if (!filename.endsWith('.md')) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract name (first heading)
    const nameMatch = content.match(/^#\s+(.+)$/m);
    const name = nameMatch ? nameMatch[1].trim() : filename.replace('.md', '');
    
    // Extract GitHub username from the filename
    const username = filename.replace('.md', '');
    
    // Extract location
    const locationMatch = content.match(/\*\*Location:\*\*\s*(.+)$/m);
    const location = locationMatch ? locationMatch[1].trim() : '';
    
    return {
      name,
      username,
      location,
      filename
    };
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error.message);
    return null;
  }
}

/**
 * Get all member profiles
 * @returns {Array} Array of member objects
 */
function getAllMembers() {
  if (!fs.existsSync(MEMBERS_DIR)) {
    console.error('Members directory not found!');
    return [];
  }
  
  const files = fs.readdirSync(MEMBERS_DIR);
  const members = files
    .map(parseMemberProfile)
    .filter(member => member !== null)
    .sort((a, b) => a.username.localeCompare(b.username));
  
  return members;
}

/**
 * Generate markdown list of members
 * @param {Array} members - Array of member objects
 * @returns {string} Markdown formatted member list
 */
function generateMemberList(members) {
  if (members.length === 0) {
    return '\n*No members yet. Be the first to join!*\n';
  }
  
  let markdown = '\n## Our Members 👥\n\n';
  markdown += `Total Members: **${members.length}**\n\n`;
  
  members.forEach(member => {
    const locationStr = member.location ? ` - ${member.location}` : '';
    markdown += `- [${member.name}](members/${member.filename}) ([@${member.username}](https://github.com/${member.username}))${locationStr}\n`;
  });
  
  markdown += '\n';
  return markdown;
}

/**
 * Update README.md with the generated member list
 * @param {string} memberList - The generated member list markdown
 */
function updateReadme(memberList) {
  if (!fs.existsSync(README_PATH)) {
    console.error('README.md not found!');
    return;
  }
  
  let readme = fs.readFileSync(README_PATH, 'utf-8');
  
  // Check if markers exist
  const hasMarkers = readme.includes(MEMBER_LIST_MARKER_START) && 
                     readme.includes(MEMBER_LIST_MARKER_END);
  
  if (hasMarkers) {
    // Replace content between markers
    const startIndex = readme.indexOf(MEMBER_LIST_MARKER_START);
    const endIndex = readme.indexOf(MEMBER_LIST_MARKER_END) + MEMBER_LIST_MARKER_END.length;
    
    const newContent = `${MEMBER_LIST_MARKER_START}\n${memberList}${MEMBER_LIST_MARKER_END}`;
    readme = readme.substring(0, startIndex) + newContent + readme.substring(endIndex);
  } else {
    // Append to the end of the file
    readme += `\n\n${MEMBER_LIST_MARKER_START}\n${memberList}${MEMBER_LIST_MARKER_END}\n`;
  }
  
  fs.writeFileSync(README_PATH, readme, 'utf-8');
  console.log('✅ README.md updated successfully!');
}

/**
 * Main function
 */
function main() {
  console.log('🔄 Generating members list...\n');
  
  const members = getAllMembers();
  console.log(`📊 Found ${members.length} member(s)\n`);
  
  const memberList = generateMemberList(members);
  updateReadme(memberList);
  
  console.log('\n✨ Done!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { parseMemberProfile, getAllMembers, generateMemberList };
