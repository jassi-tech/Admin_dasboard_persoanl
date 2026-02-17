import React from 'react';
import { Modal, Form, Input, Space, Button, Select } from 'antd';
import DeleteSecurityModal from '@/components/common/DeleteSecurityModal';
import SecurityGateModal from '@/components/common/SecurityGateModal';
import { Project, ProjectToDelete, ProjectStage } from '../types';
import styles from '../projects.module.scss';

const { Option } = Select;

interface ProjectModalsProps {
  t: any;
  // Add Project Modal
  isAddModalVisible: boolean;
  setIsAddModalVisible: (visible: boolean) => void;
  form: any;
  submitting: boolean;
  onAddProject: (values: any) => void;
  
  // Delete Modal
  deleteModalVisible: boolean;
  setDeleteModalVisible: (visible: boolean) => void;
  confirmDelete: () => void;
  projectToDelete: ProjectToDelete | null;
  
  // Security Modal
  secureModalVisible: boolean;
  setSecureModalVisible: (visible: boolean) => void;
  onSecuritySuccess: () => void;
  selectedProject: Project | null;
}

export const ProjectModals: React.FC<ProjectModalsProps> = ({
  t,
  isAddModalVisible,
  setIsAddModalVisible,
  form,
  submitting,
  onAddProject,
  deleteModalVisible,
  setDeleteModalVisible,
  confirmDelete,
  projectToDelete,
  secureModalVisible,
  setSecureModalVisible,
  onSecuritySuccess,
  selectedProject
}) => {
  return (
    <>
      {/* Add Project Modal */}
      <Modal
        title={t('modal.title')}
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onAddProject}>
          <Form.Item
            label={t('modal.name')}
            name="name"
            rules={[{ required: true, message: 'Please enter website name' }]}
          >
            <Input placeholder="e.g. My Awesome Website" />
          </Form.Item>
          <Form.Item
            label={t('modal.url')}
            name="url"
            rules={[
              { required: true, message: 'Please enter website URL' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item
            label={t('status.country')}
            name="country"
            rules={[{ required: true, message: 'Please enter hosting country' }]}
          >
            <Input placeholder="e.g. United States, India" />
          </Form.Item>
          <Form.Item
            label="Project Stage"
            name="stage"
            initialValue="Production"
            rules={[{ required: true, message: 'Please select project stage' }]}
          >
            <Select>
              <Option value="Demo">Demo</Option>
              <Option value="Production">Production</Option>
            </Select>
          </Form.Item>
          <Form.Item className={styles.modalFooter}>
            <Space>
              <Button onClick={() => setIsAddModalVisible(false)}>
                {t('modal.cancel')}
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {t('modal.submit')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <DeleteSecurityModal
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        itemName={projectToDelete?.name || ''}
        loading={submitting}
      />

      {/* Security Gate Modal */}
      {selectedProject && (
        <SecurityGateModal
          open={secureModalVisible}
          onCancel={() => setSecureModalVisible(false)}
          onSuccess={onSecuritySuccess}
          title="Admin Access Required"
          description={`Please enter your 6-digit security OTP to view sensitive credentials for ${selectedProject.name}.`}
          actionText="Unlock Details"
        />
      )}
    </>
  );
};
