# LinkedIn "Open to Work" Feature

## What's New

Added a **LinkedIn Status** field to HIRELab that allows you to filter LinkedIn profiles by their status hashtags.

---

## 📋 New Field (LinkedIn Only)

### **LinkedIn Status**
A dropdown with three options:

1. **— (None)** - No status filter
2. **#OpenToWork** - Find people actively seeking opportunities
3. **#Hiring** - Find people who are actively hiring

---

## 🔍 How It Works

### Example Search:
**Platform:** LinkedIn  
**Role:** Software Engineer  
**Include:** React, TypeScript  
**Location:** San Francisco  
**LinkedIn Status:** #OpenToWork  

**Generated Query:**
```
site:linkedin.com/in ("Software Engineer") AND ("React" AND "TypeScript") AND "San Francisco" #OpenToWork
```

This will find LinkedIn profiles of Software Engineers in San Francisco with React and TypeScript skills who have the **#OpenToWork** badge on their profile.

---

## 💡 Use Cases

### 1. Finding Active Job Seekers (#OpenToWork)
Perfect for:
- Finding qualified candidates who are actively looking
- Reaching out to people who are receptive to opportunities
- Building a pipeline of interested candidates

**Example:**
- Role: Product Manager
- LinkedIn Status: #OpenToWork
- Location: Remote
- Result: Product Managers actively seeking remote roles

### 2. Finding Hiring Managers (#Hiring)
Perfect for:
- Finding companies that are hiring
- Identifying potential partners or clients
- Building relationships with other recruiters

**Example:**
- Role: Engineering Manager
- LinkedIn Status: #Hiring
- Location: New York
- Result: Engineering Managers who are actively hiring

---

## 🎯 Field Visibility by Platform

| Platform | OpenToWork Field |
|----------|------------------|
| LinkedIn | ✅ Visible |
| GitHub | ❌ Hidden |
| Stack Overflow | ❌ Hidden |
| Dribbble | ❌ Hidden |
| Xing | ❌ Hidden |
| X (Twitter) | ❌ Hidden |

The field **only appears when LinkedIn is selected** - it won't clutter the interface for other platforms.

---

## 🔧 Technical Details

- Field added to `SearchParams` interface as `openToWork?: OpenToWorkStatus`
- Builder logic adds hashtag to query when selected
- Fully integrated with save/load search functionality
- Works with all search engines (Google, Bing)

---

## ✅ Benefits

1. **More Targeted Searches** - Find people who are actually looking for jobs
2. **Higher Response Rates** - Reach out to candidates who want to be contacted
3. **Better Signal** - Focus on quality leads vs cold outreach
4. **Dual Purpose** - Can also find hiring managers or companies that are hiring

---

Ready to test! Switch to the LinkedIn tab and you'll see the new **LinkedIn Status** dropdown field. 🚀


