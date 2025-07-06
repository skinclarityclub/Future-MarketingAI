# SKC BI Dashboard - Monitoring Stack Training Curriculum

## Course Overview

This training program provides comprehensive education for the operations team to effectively manage, maintain, and extend the SKC BI Dashboard observability stack. The curriculum is designed for a 40-hour training program over 5 days.

### Learning Objectives

By the end of this training, participants will be able to:

- Monitor and maintain the high availability observability stack
- Respond to incidents and alerts effectively
- Perform routine maintenance and optimization tasks
- Troubleshoot common issues independently
- Implement security best practices
- Execute backup and recovery procedures

### Prerequisites

- Basic understanding of Docker and containerization
- Familiarity with Linux command line
- Basic networking knowledge
- Understanding of HTTP/REST APIs
- Experience with YAML configuration files

---

## Day 1: Foundation and Architecture

### Module 1.1: Introduction to Observability (2 hours)

**Learning Objectives:**

- Understand the three pillars of observability
- Learn the importance of 99.99% SLA requirements
- Understand the business impact of monitoring

**Topics Covered:**

- What is observability vs monitoring
- Metrics, logs, and traces explained
- SLA vs SLO vs SLI concepts
- Cost of downtime for the business
- Introduction to the SKC BI Dashboard stack

**Hands-on Activities:**

- Review current SLA dashboard
- Calculate downtime costs
- Explore the monitoring architecture diagram

**Assessment:**

- Quiz on observability concepts (15 minutes)

### Module 1.2: Architecture Deep Dive (3 hours)

**Learning Objectives:**

- Understand the complete monitoring stack architecture
- Learn how high availability is achieved
- Understand data flow and dependencies

**Topics Covered:**

- Prometheus cluster architecture
- Alertmanager clustering and gossip protocol
- HAProxy load balancing configuration
- Elasticsearch cluster setup
- Grafana high availability design
- Network architecture and security

**Hands-on Activities:**

- Architecture walkthrough with live system
- Explore HAProxy statistics dashboard
- Review cluster status for each component

**Assessment:**

- Architecture diagram labeling exercise (30 minutes)

### Module 1.3: Initial System Exploration (3 hours)

**Learning Objectives:**

- Navigate all monitoring interfaces
- Understand basic operational commands
- Learn how to check system health

**Topics Covered:**

- Accessing Prometheus web interface
- Navigating Grafana dashboards
- Using Alertmanager interface
- HAProxy statistics interpretation
- Docker container management basics

**Hands-on Activities:**

- Guided tour of all monitoring interfaces
- Practice basic health check commands
- Review current alerts and metrics

**Assessment:**

- Practical navigation test (30 minutes)

---

## Day 2: Daily Operations and Monitoring

### Module 2.1: Daily Health Checks (2.5 hours)

**Learning Objectives:**

- Master the daily health check routine
- Learn to identify potential issues early
- Understand when to escalate concerns

**Topics Covered:**

- Morning health check checklist
- Container status verification
- Resource utilization monitoring
- SLA compliance verification
- Alert queue management

**Hands-on Activities:**

- Perform complete morning health check
- Practice identifying unhealthy services
- Document findings in operations log

**Assessment:**

- Simulated health check scenario (45 minutes)

### Module 2.2: Metrics and Dashboards (3 hours)

**Learning Objectives:**

- Understand key metrics and their meanings
- Learn to interpret Grafana dashboards
- Create basic custom dashboards

**Topics Covered:**

- Prometheus metrics types and naming
- Key system and application metrics
- Grafana dashboard navigation
- Creating and modifying panels
- Setting up alerts on dashboards

**Hands-on Activities:**

- Create a custom dashboard for team use
- Modify existing dashboard panels
- Set up dashboard alerts

**Assessment:**

- Dashboard creation exercise (1 hour)

### Module 2.3: Alert Management (2.5 hours)

**Learning Objectives:**

- Understand alert lifecycle
- Learn to manage alert routing
- Practice alert acknowledgment and resolution

**Topics Covered:**

- Alert severity levels and response times
- Alertmanager routing and grouping
- Slack and PagerDuty integrations
- Alert silence and inhibition
- Alert escalation procedures

**Hands-on Activities:**

- Practice acknowledging alerts
- Create temporary silences
- Test alert routing rules

**Assessment:**

- Alert management scenario (30 minutes)

---

## Day 3: Troubleshooting and Incident Response

### Module 3.1: Troubleshooting Methodology (2 hours)

**Learning Objectives:**

- Learn systematic troubleshooting approach
- Understand common failure patterns
- Develop diagnostic skills

**Topics Covered:**

- Structured troubleshooting process
- Log analysis techniques
- Using metrics for diagnosis
- Common failure modes
- When to escalate vs resolve

**Hands-on Activities:**

- Practice systematic problem diagnosis
- Analyze historical incidents
- Use troubleshooting decision trees

**Assessment:**

- Troubleshooting scenario simulation (45 minutes)

### Module 3.2: Common Issues and Solutions (3 hours)

**Learning Objectives:**

- Recognize and resolve common problems
- Learn component-specific troubleshooting
- Build confidence in problem resolution

**Topics Covered:**

- Prometheus instance failures
- Alertmanager cluster issues
- Grafana connectivity problems
- HAProxy backend failures
- Network connectivity issues
- Resource exhaustion scenarios

**Hands-on Activities:**

- Simulated failure scenarios
- Practice using troubleshooting runbooks
- Document resolution steps

**Assessment:**

- Hands-on troubleshooting test (1 hour)

### Module 3.3: Incident Response Procedures (3 hours)

**Learning Objectives:**

- Master incident response workflow
- Learn effective communication during incidents
- Understand post-incident procedures

**Topics Covered:**

- Incident classification and severity
- Response timelines and escalation
- Communication templates and channels
- War room procedures
- Post-incident review process

**Hands-on Activities:**

- Incident response simulation
- Practice communication procedures
- Role-play escalation scenarios

**Assessment:**

- Incident response drill (1 hour)

---

## Day 4: Maintenance and Optimization

### Module 4.1: Routine Maintenance (2.5 hours)

**Learning Objectives:**

- Learn scheduled maintenance procedures
- Understand configuration management
- Practice safe update processes

**Topics Covered:**

- Weekly and monthly maintenance tasks
- Configuration backup and validation
- Rolling updates and zero-downtime deployment
- Service restart procedures
- Maintenance windows and planning

**Hands-on Activities:**

- Perform weekly maintenance checklist
- Practice configuration updates
- Execute rolling restart procedures

**Assessment:**

- Maintenance procedure checklist (30 minutes)

### Module 4.2: Performance Monitoring and Tuning (3 hours)

**Learning Objectives:**

- Identify performance bottlenecks
- Learn optimization techniques
- Understand capacity planning

**Topics Covered:**

- Performance metrics interpretation
- Query optimization for Prometheus
- Grafana dashboard performance
- Resource allocation and limits
- Capacity planning principles

**Hands-on Activities:**

- Analyze performance metrics
- Optimize slow-running queries
- Plan resource scaling scenarios

**Assessment:**

- Performance analysis exercise (45 minutes)

### Module 4.3: Configuration Management (2.5 hours)

**Learning Objectives:**

- Safely modify configurations
- Understand version control for configs
- Learn testing and validation procedures

**Topics Covered:**

- Configuration file structure
- YAML syntax and validation
- Configuration testing procedures
- Version control best practices
- Rollback procedures

**Hands-on Activities:**

- Modify alert rules safely
- Practice configuration validation
- Simulate rollback scenarios

**Assessment:**

- Configuration modification test (30 minutes)

---

## Day 5: Security, Backup, and Advanced Topics

### Module 5.1: Security Operations (2.5 hours)

**Learning Objectives:**

- Implement security best practices
- Manage credentials and access control
- Monitor for security issues

**Topics Covered:**

- Role-based access control
- API key and credential management
- Network security considerations
- Security monitoring and alerting
- Compliance requirements

**Hands-on Activities:**

- Review and update access controls
- Practice credential rotation
- Set up security monitoring alerts

**Assessment:**

- Security checklist verification (30 minutes)

### Module 5.2: Backup and Recovery (3 hours)

**Learning Objectives:**

- Understand backup strategies
- Learn recovery procedures
- Practice disaster recovery scenarios

**Topics Covered:**

- Backup scheduling and automation
- Data retention policies
- Recovery point and time objectives
- Disaster recovery procedures
- Business continuity planning

**Hands-on Activities:**

- Perform manual backup procedures
- Practice data restoration
- Execute disaster recovery drill

**Assessment:**

- Recovery scenario simulation (1 hour)

### Module 5.3: Advanced Topics and Certification (2.5 hours)

**Learning Objectives:**

- Learn advanced monitoring concepts
- Understand stack extensibility
- Prepare for ongoing learning

**Topics Covered:**

- Custom metrics and exporters
- Advanced alerting strategies
- Integration with external systems
- Monitoring stack scaling
- Continuous improvement processes

**Hands-on Activities:**

- Create custom monitoring solution
- Plan monitoring improvements
- Set up learning resources

**Assessment:**

- Final certification exam (1.5 hours)

---

## Training Materials and Resources

### Required Materials

- Laptop with Docker and SSH access
- Access to staging monitoring environment
- Training manual and reference guides
- Lab exercise worksheets

### Reference Documentation

- Operations Manual (comprehensive)
- Troubleshooting Runbooks
- Configuration Reference Guide
- Emergency Contact Information

### Online Resources

- Prometheus documentation
- Grafana tutorials
- Alertmanager guides
- Docker best practices

### Assessment Tools

- Knowledge check quizzes
- Practical skill assessments
- Scenario-based evaluations
- Final certification exam

---

## Certification Requirements

### Passing Criteria

- **Knowledge Tests**: 80% minimum score on all quizzes
- **Practical Assessments**: Successfully complete all hands-on exercises
- **Final Exam**: 85% minimum score on comprehensive exam
- **Incident Drill**: Demonstrate competency in incident response

### Certification Levels

#### Level 1: Operations Specialist

- Complete Days 1-3 successfully
- Pass basic troubleshooting scenarios
- Demonstrate daily operations competency

#### Level 2: Senior Operations Engineer

- Complete full 5-day program
- Pass advanced troubleshooting scenarios
- Demonstrate maintenance and optimization skills

#### Level 3: Operations Team Lead

- Complete certification program
- Lead incident response drill successfully
- Demonstrate training capability for new team members

### Continuing Education

- Quarterly update sessions (4 hours)
- Annual recertification requirements
- Access to ongoing learning resources
- Conference and training opportunities

---

## Lab Exercise Examples

### Exercise 1: Health Check Simulation

**Objective**: Perform complete system health check
**Duration**: 30 minutes
**Scenario**: Monday morning routine health check
**Expected Outcome**: Identify 3 planted issues and document findings

### Exercise 2: Alert Response Drill

**Objective**: Respond to critical alert properly
**Duration**: 45 minutes
**Scenario**: SLA breach alert triggered
**Expected Outcome**: Follow incident response procedure within time limits

### Exercise 3: Configuration Update

**Objective**: Safely update monitoring configuration
**Duration**: 1 hour
**Scenario**: Add new service monitoring
**Expected Outcome**: Successfully deploy configuration without downtime

### Exercise 4: Recovery Simulation

**Objective**: Restore from backup after simulated failure
**Duration**: 1.5 hours
**Scenario**: Complete Prometheus data loss
**Expected Outcome**: Restore service within RTO requirements

---

## Post-Training Support

### Mentorship Program

- 30-day mentorship with senior team member
- Weekly check-ins and guidance
- Gradual increase in responsibility

### Knowledge Base Access

- Internal wiki and documentation
- Searchable troubleshooting database
- Video tutorials and recorded sessions

### Support Channels

- Slack channel for questions and discussions
- Weekly team meetings for knowledge sharing
- Monthly lunch-and-learn sessions

### Continuous Improvement

- Regular feedback collection
- Training material updates
- New scenario development based on real incidents

---

## Training Schedule Template

### Week 1: Foundation Training

- **Monday**: Day 1 - Foundation and Architecture
- **Tuesday**: Day 2 - Daily Operations
- **Wednesday**: Day 3 - Troubleshooting
- **Thursday**: Day 4 - Maintenance
- **Friday**: Day 5 - Security and Advanced Topics

### Week 2: Practical Application

- **Monday-Wednesday**: Shadowing experienced team members
- **Thursday**: Independent operations with supervision
- **Friday**: Final assessment and certification

### Ongoing Schedule

- **Monthly**: Refresher sessions (2 hours)
- **Quarterly**: Advanced topics and updates (4 hours)
- **Annually**: Full recertification (8 hours)

---

_This training curriculum is maintained by the DevOps team and updated based on operational experience and feedback from trainees._
