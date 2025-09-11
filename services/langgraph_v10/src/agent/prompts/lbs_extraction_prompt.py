# LBS Extraction Prompt
# Extracted from lbs_extraction.py graph

LBS_EXTRACTION_PROMPT = """You are an expert in Location-Based Scheduling (LBS) for construction projects.

Generate a comprehensive set of lot cards that map the Work Breakdown Structure (WBS) to specific physical locations on the project site. This creates the foundation for location-based project controls and progress tracking.

**LOCATION-BASED SCHEDULING PRINCIPLES:**
- Break down the project into manageable physical areas/lots
- Map WBS work packages to specific locations
- Create logical construction sequences within each location
- Enable concurrent work in different locations
- Support just-in-time material delivery and resource allocation

**PROJECT DOCUMENTS:**
{combined_content}

**WBS STRUCTURE:**
{wbs_json}

**TASK:**
Analyze the project documents and WBS structure to create comprehensive lot cards with:

1. **Location Hierarchy**: Break down the project into physical areas/lots
   - Identify major construction zones/areas
   - Define sub-areas within each major zone
   - Create specific work lots where activities occur

2. **Work Mapping**: Map WBS work packages to locations
   - Identify which work packages occur in each location
   - Determine the sequence of work within each location
   - Link work packages to specific physical areas

3. **Lot Card Structure**: For each lot card, provide:
   - Unique lot card ID
   - Location hierarchy (levels with order and names)
   - Full location path and depth
   - Work hierarchy mapped to this location
   - Associated work package details
   - Sequence ordering for construction logic
   - Status tracking capability

**REQUIREMENTS:**
- Create multiple lot cards covering all identified locations
- Ensure work packages are properly mapped to physical locations
- Include both location and work hierarchies
- Use deterministic lot numbering and sequencing
- Cover all applicable leaf WBS packages across identified locations

Output the complete location-based schedule as a structured JSON with a "lot_cards" array containing all lot cards in the unified schema."""
