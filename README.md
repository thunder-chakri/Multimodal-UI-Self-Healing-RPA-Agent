# OmniSight: Multimodal UI Self-Healing & RPA Agent

## Project Overview
OmniSight is a proposed Generative AI project focused on creating an automation agent that can interact with user interfaces and recover from changes that would otherwise break automated workflows.

**Project name:** OmniSight: Multimodal UI Self-Healing & RPA Agent  
**Organization:** Infotact Solutions  
**Domain:** Generative AI  
**Internship role:** Associate L1 Intern  
**Project period:** 10 October 2026 – 10 November 2026  
**Project completion duration:** 1 month

## Project Objective
The assignment letter calls for practical exposure to real-world Generative AI workflows, including developing and testing applications, working with large language models (LLMs), prompt engineering, AI API and framework integration, deployment, and documentation.

## Proposed Solution
> The following technical design is a suggested implementation, not a detailed specification supplied in the assignment letter.

Build an RPA agent that:
1. Accepts a user-defined browser task.
2. Identifies UI controls using browser structure and, where useful, screenshots.
3. Executes the task and records each step.
4. Detects failures when an element is missing or has changed.
5. Attempts to find a replacement control, validates it, and resumes the workflow.
6. Produces execution logs and a summary of recovered failures.

## Suggested Technology Stack
- **Language:** Python
- **Browser automation:** Playwright
- **API/backend:** FastAPI (optional)
- **AI integration:** An LLM API with multimodal support, if available
- **Data storage:** SQLite for workflow and execution logs
- **Frontend:** HTML, CSS, and JavaScript (optional dashboard)
- **Version control:** Git and GitHub

## Suggested Project Structure
```text
omnisight/
├── README.md
├── requirements.txt
├── .env.example
├── app/
│   ├── main.py
│   ├── agent.py
│   ├── browser.py
│   ├── healing.py
│   └── logging_utils.py
├── tests/
│   └── test_workflows.py
├── docs/
│   └── project_report.md
└── screenshots/
```

## Proposed One-Month Plan
| Week | Focus |
| --- | --- |
| 1 | Requirements, architecture, and initial browser automation |
| 2 | UI detection and task execution |
| 3 | Self-healing logic, logging, and evaluation |
| 4 | Testing, documentation, presentation, and demonstration |

## Evaluation Ideas
Measure task completion rate, recovery success rate, number of manual interventions, and average execution time. Test against controlled UI changes such as renamed buttons, altered selectors, or repositioned fields.

## Assignment Deliverables
The assignment letter requests:
- Source code (if applicable)
- Project documentation
- Project report
- Presentation (PPT)
- Model evaluation results (if applicable)
- Final project demonstration (if applicable)

## Important Notes
- The assignment letter describes broad Generative AI responsibilities but does not provide a detailed OmniSight architecture or mandatory programming languages.
- Use only authorized test websites and accounts for browser automation.
- Keep API keys in environment variables and do not commit secrets to Git.
- Ensure submitted work is original and follows the organization's confidentiality requirements.

## Getting Started
1. Define 2–3 sample browser workflows on a test website you control.
2. Implement a basic Playwright script for each workflow.
3. Introduce controlled UI changes and observe failures.
4. Implement candidate element matching and safe recovery.
5. Record outcomes and prepare a final demo.

<!-- Keval's Part of Documentation -->
## RPA Automation library installation:
```bash
uv pip install -r requirements.txt
```

#### OR

```bash
pip install -r requirements.txt
```

- Install Chromium, firefox or any web library for the output.
```bash
uv playwright install chromium
```

##### OR

```bash
playwright install chromium
```

## Running the script for the Playwrite automation:
- Here I created the saucedemo order demo automation the use that webpage and below mention work is doing.
- 1. First login in the web with login and password.
- 2. then go to Order section and fetch the order and make an order.
- 3. After that it's doing the final checkout.
- 4. then again run that for the Mobile view also.
- 5. Same process run for the mobile view.

### How to run and activate rpa automation:
```bash
pytest --browser chromium --headed --slowmo 500 -v -s
```
- It can run Slowly on web so QA or any developer can see what happens in the automation.


### RPA automation working directory:
- In src/multimodel-UI-self-healing-rpa-agent there is two folders are there.
- 1. pages
- 2. test example
- 3. conftests.py

### RPA automation audit-log:
- after compliting the script run it logs the files in this audit_logs folder with video folder, some screenshots and json data for tracking this screenshots.
