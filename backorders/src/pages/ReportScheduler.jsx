import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';

const ReportScheduler = ({ onShowToast, onOpenModal }) => {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      name: 'Daily Back Order Summary',
      reportType: 'summary',
      frequency: 'daily',
      time: '09:00',
      recipients: 'operations@medplus.com, manager@medplus.com',
      format: 'Excel',
      active: true,
      lastSent: '2025-11-01 09:00:00',
      nextScheduled: '2025-11-02 09:00:00'
    },
    {
      id: 2,
      name: 'Weekly Fulfilment Report',
      reportType: 'detailed',
      frequency: 'weekly',
      time: '10:00',
      recipients: 'procurement@medplus.com',
      format: 'PDF',
      active: true,
      lastSent: '2025-10-28 10:00:00',
      nextScheduled: '2025-11-04 10:00:00'
    },
    {
      id: 3,
      name: 'Exception Orders Alert',
      reportType: 'exceptions',
      frequency: 'daily',
      time: '16:00',
      recipients: 'supervisor@medplus.com',
      format: 'Email',
      active: false,
      lastSent: '2025-10-31 16:00:00',
      nextScheduled: '-'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    reportType: 'summary',
    frequency: 'daily',
    time: '09:00',
    recipients: '',
    format: 'Excel',
    active: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCreateSchedule = () => {
    const newSchedule = {
      id: schedules.length + 1,
      ...formData,
      lastSent: '-',
      nextScheduled: calculateNextSchedule(formData.frequency, formData.time)
    };

    setSchedules([...schedules, newSchedule]);
    setShowForm(false);
    setFormData({
      name: '',
      reportType: 'summary',
      frequency: 'daily',
      time: '09:00',
      recipients: '',
      format: 'Excel',
      active: true
    });
    onShowToast('Report schedule created successfully!');
  };

  const calculateNextSchedule = (frequency, time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const next = new Date();
    next.setHours(parseInt(hours), parseInt(minutes), 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    if (frequency === 'weekly') {
      next.setDate(next.getDate() + (7 - now.getDay()));
    } else if (frequency === 'monthly') {
      next.setMonth(next.getMonth() + 1, 1);
    }

    return next.toISOString().slice(0, 16).replace('T', ' ');
  };

  const handleToggleActive = (id) => {
    setSchedules(schedules.map(schedule => {
      if (schedule.id === id) {
        const active = !schedule.active;
        return {
          ...schedule,
          active,
          nextScheduled: active ? calculateNextSchedule(schedule.frequency, schedule.time) : '-'
        };
      }
      return schedule;
    }));
    onShowToast('Schedule status updated');
  };

  const handleDelete = (id) => {
    const schedule = schedules.find(s => s.id === id);
    const confirmContent = `
      <div class="mb-3">
        <p>Are you sure you want to delete this schedule?</p>
        <div class="alert alert-warning">
          <strong>${schedule.name}</strong><br/>
          Frequency: ${schedule.frequency}<br/>
          Recipients: ${schedule.recipients}
        </div>
        <p class="text-danger">This action cannot be undone.</p>
      </div>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" onclick="document.querySelector('.modal .btn-close').click()">Cancel</button>
        <button class="btn btn-danger" onclick="window.deleteSchedule(${id})">Delete Schedule</button>
      </div>
    `;
    
    window.deleteSchedule = (scheduleId) => {
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      document.querySelector('.modal .btn-close').click();
      onShowToast('Schedule deleted successfully');
    };
    
    onOpenModal('Delete Schedule', confirmContent, 'modal-md');
  };

  const handleRunNow = (id) => {
    const schedule = schedules.find(s => s.id === id);
    onShowToast(`Sending ${schedule.name} to ${schedule.recipients}...`);
    
    // Simulate sending
    setTimeout(() => {
      setSchedules(schedules.map(s => {
        if (s.id === id) {
          return {
            ...s,
            lastSent: new Date().toISOString().slice(0, 19).replace('T', ' '),
            nextScheduled: s.active ? calculateNextSchedule(s.frequency, s.time) : '-'
          };
        }
        return s;
      }));
      onShowToast('Report sent successfully!');
    }, 2000);
  };

  const handleEdit = (schedule) => {
    const editContent = `
      <div class="mb-3">
        <form id="editScheduleForm">
          <div class="mb-3">
            <label class="form-label fw-medium">Schedule Name</label>
            <input type="text" class="form-control" id="edit_name" value="${schedule.name}" />
          </div>
          <div class="mb-3">
            <label class="form-label fw-medium">Report Type</label>
            <select class="form-select" id="edit_reportType">
              <option value="summary" ${schedule.reportType === 'summary' ? 'selected' : ''}>Summary Report</option>
              <option value="detailed" ${schedule.reportType === 'detailed' ? 'selected' : ''}>Detailed Report</option>
              <option value="exceptions" ${schedule.reportType === 'exceptions' ? 'selected' : ''}>Exception Orders</option>
              <option value="analytics" ${schedule.reportType === 'analytics' ? 'selected' : ''}>Analytics Dashboard</option>
              <option value="sourcing" ${schedule.reportType === 'sourcing' ? 'selected' : ''}>Sourcing Status</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-medium">Frequency</label>
            <select class="form-select" id="edit_frequency">
              <option value="daily" ${schedule.frequency === 'daily' ? 'selected' : ''}>Daily</option>
              <option value="weekly" ${schedule.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
              <option value="monthly" ${schedule.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-medium">Time</label>
            <input type="time" class="form-control" id="edit_time" value="${schedule.time}" />
          </div>
          <div class="mb-3">
            <label class="form-label fw-medium">Recipients (comma separated)</label>
            <textarea class="form-control" id="edit_recipients" rows="2">${schedule.recipients}</textarea>
          </div>
          <div class="mb-3">
            <label class="form-label fw-medium">Format</label>
            <select class="form-select" id="edit_format">
              <option value="Excel" ${schedule.format === 'Excel' ? 'selected' : ''}>Excel (.xlsx)</option>
              <option value="CSV" ${schedule.format === 'CSV' ? 'selected' : ''}>CSV</option>
              <option value="PDF" ${schedule.format === 'PDF' ? 'selected' : ''}>PDF</option>
              <option value="Email" ${schedule.format === 'Email' ? 'selected' : ''}>Email (HTML)</option>
            </select>
          </div>
        </form>
      </div>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" onclick="document.querySelector('.modal .btn-close').click()">Cancel</button>
        <button class="btn btn-primary" onclick="window.updateSchedule(${schedule.id})">Save Changes</button>
      </div>
    `;

    window.updateSchedule = (scheduleId) => {
      const updatedSchedule = {
        ...schedules.find(s => s.id === scheduleId),
        name: document.getElementById('edit_name').value,
        reportType: document.getElementById('edit_reportType').value,
        frequency: document.getElementById('edit_frequency').value,
        time: document.getElementById('edit_time').value,
        recipients: document.getElementById('edit_recipients').value,
        format: document.getElementById('edit_format').value,
        nextScheduled: calculateNextSchedule(
          document.getElementById('edit_frequency').value,
          document.getElementById('edit_time').value
        )
      };

      setSchedules(schedules.map(s => s.id === scheduleId ? updatedSchedule : s));
      document.querySelector('.modal .btn-close').click();
      onShowToast('Schedule updated successfully!');
    };

    onOpenModal('Edit Schedule', editContent, 'modal-lg');
  };

  const getFrequencyBadge = (frequency) => {
    const colors = {
      daily: 'primary',
      weekly: 'info',
      monthly: 'success'
    };
    return <Badge bg={colors[frequency] || 'secondary'}>{frequency}</Badge>;
  };

  const getReportTypeName = (type) => {
    const names = {
      summary: 'Summary Report',
      detailed: 'Detailed Report',
      exceptions: 'Exception Orders',
      analytics: 'Analytics Dashboard',
      sourcing: 'Sourcing Status'
    };
    return names[type] || type;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Report Scheduler & Auto-Email</h2>
        <Button 
          variant="primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Schedule'}
        </Button>
      </div>

      {/* Statistics */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="kpi-title">Total Schedules</div>
              <div className="kpi-value">{schedules.length}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="kpi-title">Active Schedules</div>
              <div className="kpi-value text-success">{schedules.filter(s => s.active).length}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="kpi-title">Reports Sent Today</div>
              <div className="kpi-value">
                {schedules.filter(s => s.lastSent.startsWith('2025-11-01')).length}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="kpi-card">
            <Card.Body>
              <div className="kpi-title">Next Report</div>
              <div className="kpi-value" style={{ fontSize: '1rem' }}>
                {schedules.filter(s => s.active).length > 0 
                  ? schedules.filter(s => s.active).sort((a, b) => 
                      new Date(a.nextScheduled) - new Date(b.nextScheduled)
                    )[0]?.nextScheduled.slice(11, 16)
                  : '-'}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Schedule Form */}
      {showForm && (
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white fw-bold">
            Create New Report Schedule
          </Card.Header>
          <Card.Body>
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Schedule Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Daily Back Order Summary"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Report Type</Form.Label>
                    <Form.Select
                      name="reportType"
                      value={formData.reportType}
                      onChange={handleInputChange}
                    >
                      <option value="summary">Summary Report</option>
                      <option value="detailed">Detailed Report</option>
                      <option value="exceptions">Exception Orders</option>
                      <option value="analytics">Analytics Dashboard</option>
                      <option value="sourcing">Sourcing Status</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Frequency</Form.Label>
                    <Form.Select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly (Monday)</option>
                      <option value="monthly">Monthly (1st)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Format</Form.Label>
                    <Form.Select
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                    >
                      <option value="Excel">Excel (.xlsx)</option>
                      <option value="CSV">CSV</option>
                      <option value="PDF">PDF</option>
                      <option value="Email">Email (HTML)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Recipients (comma separated email addresses)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="recipients"
                      value={formData.recipients}
                      onChange={handleInputChange}
                      placeholder="email1@company.com, email2@company.com"
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Check
                    type="checkbox"
                    name="active"
                    label="Activate schedule immediately"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleCreateSchedule}
                  disabled={!formData.name || !formData.recipients}
                >
                  Create Schedule
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Schedules Table */}
      <Card>
        <Card.Header className="bg-light">
          <h5 className="mb-0">Scheduled Reports</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Schedule Name</th>
                  <th>Report Type</th>
                  <th>Frequency</th>
                  <th>Time</th>
                  <th>Recipients</th>
                  <th>Format</th>
                  <th>Last Sent</th>
                  <th>Next Scheduled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center text-muted py-4">
                      No schedules configured. Click "New Schedule" to create one.
                    </td>
                  </tr>
                ) : (
                  schedules.map(schedule => (
                    <tr key={schedule.id}>
                      <td className="fw-medium">{schedule.name}</td>
                      <td>{getReportTypeName(schedule.reportType)}</td>
                      <td>{getFrequencyBadge(schedule.frequency)}</td>
                      <td>{schedule.time}</td>
                      <td>
                        <small className="text-muted">
                          {schedule.recipients.split(',').length} recipient(s)
                        </small>
                      </td>
                      <td>
                        <Badge bg="secondary">{schedule.format}</Badge>
                      </td>
                      <td>
                        <small>{schedule.lastSent}</small>
                      </td>
                      <td>
                        <small className="text-primary">{schedule.nextScheduled}</small>
                      </td>
                      <td>
                        <Badge bg={schedule.active ? 'success' : 'secondary'}>
                          {schedule.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleRunNow(schedule.id)}
                            title="Send Now"
                          >
                            ▶
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => handleEdit(schedule)}
                            title="Edit"
                          >
                            ✎
                          </Button>
                          <Button
                            size="sm"
                            variant={schedule.active ? 'outline-warning' : 'outline-success'}
                            onClick={() => handleToggleActive(schedule.id)}
                            title={schedule.active ? 'Pause' : 'Activate'}
                          >
                            {schedule.active ? '⏸' : '▶'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(schedule.id)}
                            title="Delete"
                          >
                            🗑
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Email Configuration */}
      <Card className="mt-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Email Configuration</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">SMTP Server</Form.Label>
                  <Form.Control type="text" defaultValue="smtp.medplus.com" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-medium">Port</Form.Label>
                  <Form.Control type="number" defaultValue="587" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-medium">Encryption</Form.Label>
                  <Form.Select defaultValue="TLS">
                    <option value="TLS">TLS</option>
                    <option value="SSL">SSL</option>
                    <option value="None">None</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">From Email</Form.Label>
                  <Form.Control type="email" defaultValue="reports@medplus.com" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">From Name</Form.Label>
                  <Form.Control type="text" defaultValue="MedPlus Back Order System" />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Button variant="primary" onClick={() => onShowToast('Email configuration saved')}>
                  Save Configuration
                </Button>
                <Button variant="outline-secondary" className="ms-2" onClick={() => onShowToast('Test email sent to your address')}>
                  Send Test Email
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportScheduler;
