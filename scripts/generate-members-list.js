#!/usr/bin/env node

/**
 * Generate Members List Script
 * 
 * This script automatically generates a list of all members from the members/ directory
 * and can be used to update the README.md or create a members list page.
 * 
 * Usage: node scripts/generate-members-list.js
 */

const fs = require('fs');
const path = require('path');

const MEMBERS_DIR = path.join(__dirname, '..', 'members');
const EXAMPLE_FILE = 'example-profile.md';

/**
 * Extract basic info from a member profile
 */
function parseMemberProfile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract name from first heading
    const nameLine = lines.find(line => line.startsWith('# '));
    const name = nameLine ? nameLine.replace('# ', '').trim() : 'Unknown';
    
    // Extract GitHub username from the filename
    const fileName = path.basename(filePath, '.md');
    
    return {
      name,
      username: fileName,
      fileName,
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get all member profiles
 */
function getAllMembers() {
  try {
    const files = fs.readdirSync(MEMBERS_DIR);
    
    const members = files
      .filter(file => file.endsWith('.md') && file !== EXAMPLE_FILE)
      .map(file => parseMemberProfile(path.join(MEMBERS_DIR, file)))
      .filter(member => member !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return members;
  } catch (error) {
    console.error('Error reading members directory:', error.message);
    return [];
  }
}

/**
 * Generate markdown list of members
 */
function generateMembersList(members) {
  if (members.length === 0) {
    return 'No members yet. Be the first to join!';
  }
  
  let markdown = `## Our Members (${members.length})\n\n`;
  
  members.forEach((member, index) => {
    markdown += `${index + 1}. **${member.name}** - [@${member.username}](members/${member.fileName}.md)\n`;
  });
  
  return markdown;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning members directory...');
  
  const members = getAllMembers();
  
  console.log(`✅ Found ${members.length} member(s)`);
  
  const membersList = generateMembersList(members);
  
  console.log('\n' + '='.repeat(50));
  console.log(membersList);
  console.log('='.repeat(50));
  
  // Optionally write to a file
  const outputFile = path.join(__dirname, '..', 'MEMBERS.md');
  fs.writeFileSync(outputFile, membersList);
  console.log(`\n📝 Members list written to ${outputFile}`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { getAllMembers, generateMembersList, parseMemberProfile };
