import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MediaPreview from '../../components/shared/MediaPreview.vue';

describe('MediaPreview.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('renders correctly with image file', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    wrapper = mount(MediaPreview, {
      props: {
        file: mockFile,
        type: 'foto',
        size: 'medium'
      }
    });

    expect(wrapper.find('.media-preview').exists()).toBe(true);
    expect(wrapper.find('.preview-image').exists()).toBe(true);
  });

  it('renders correctly with video file', () => {
    const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    
    wrapper = mount(MediaPreview, {
      props: {
        file: mockFile,
        type: 'video',
        size: 'large'
      }
    });

    expect(wrapper.find('.media-preview').exists()).toBe(true);
    expect(wrapper.find('.preview-video').exists()).toBe(true);
    expect(wrapper.find('.video-overlay').exists()).toBe(true);
  });

  it('renders correctly with URL string', () => {
    wrapper = mount(MediaPreview, {
      props: {
        file: 'https://example.com/image.jpg',
        type: 'foto',
        size: 'small'
      }
    });

    expect(wrapper.find('.media-preview').exists()).toBe(true);
    expect(wrapper.find('.preview-image').exists()).toBe(true);
  });

  it('shows remove button when removable prop is true', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    wrapper = mount(MediaPreview, {
      props: {
        file: mockFile,
        type: 'foto',
        removable: true
      }
    });

    expect(wrapper.find('.remove-btn').exists()).toBe(true);
  });

  it('does not show remove button when removable prop is false', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    wrapper = mount(MediaPreview, {
      props: {
        file: mockFile,
        type: 'foto',
        removable: false
      }
    });

    expect(wrapper.find('.remove-btn').exists()).toBe(false);
  });

  it('emits remove event when remove button is clicked', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    wrapper = mount(MediaPreview, {
      props: {
        file: mockFile,
        type: 'foto',
        removable: true
      }
    });

    await wrapper.find('.remove-btn').trigger('click');
    
    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('remove')).toHaveLength(1);
  });

  it('emits click event when preview is clicked', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    wrapper = mount(MediaPreview, {
      props: {
        file: mockFile,
        type: 'foto'
      }
    });

    await wrapper.find('.preview-container').trigger('click');
    
    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')).toHaveLength(1);
    expect(wrapper.emitted('click')[0]).toEqual(['mock-url']);
  });

  it('applies correct size classes', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    wrapper = mount(MediaPreview, {
      props: {
        file: mockFile,
        type: 'foto',
        size: 'small'
      }
    });

    expect(wrapper.find('.media-preview').classes()).toContain('w-16');
    expect(wrapper.find('.media-preview').classes()).toContain('h-16');
  });

  it('shows loading state initially', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    wrapper = mount(MediaPreview, {
      props: {
        file: mockFile,
        type: 'foto'
      }
    });

    await wrapper.vm.$nextTick();

    // After generating preview, should show the image
    expect(wrapper.find('.preview-image').exists()).toBe(true);
  });

  it('validates props correctly', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Invalid type should show warning
    wrapper = mount(MediaPreview, {
      props: {
        file: 'test.jpg',
        type: 'invalid'
      }
    });

    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
