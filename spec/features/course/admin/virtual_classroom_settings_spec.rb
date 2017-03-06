# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: VirtualClassroom' do
  let!(:instance) { create(:instance, :with_virtual_classroom_component_enabled) }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_virtual_classroom_component_enabled) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can change the virtual classroom pagination settings' do
        visit course_admin_virtual_classrooms_path(course)

        invalid_pagination_count = -1
        valid_pagination_count = 100

        fill_in 'virtual_classroom_settings_pagination', with: invalid_pagination_count
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in 'virtual_classroom_settings_pagination', with: valid_pagination_count
        click_button 'update'
        expect(page).
          to have_selector('div',
                           text: I18n.t('course.admin.virtual_classroom_settings.update.success'))
        expect(page).to have_field('virtual_classroom_settings_pagination',
                                   with: valid_pagination_count)
      end

      scenario 'I can change the virtual classrooms title' do
        visit course_admin_virtual_classrooms_path(course)

        new_title = 'New Title'
        empty_title = ''

        fill_in 'virtual_classroom_settings_title', with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div',
                           text: I18n.t('course.admin.virtual_classroom_settings.update.success'))
        expect(page).to have_field('virtual_classroom_settings_title', with: new_title)
        expect(page).to have_selector('li a', text: new_title)

        fill_in 'virtual_classroom_settings_title', with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('div',
                           text: I18n.t('course.admin.virtual_classroom_settings.update.success'))
        expect(page).to have_selector('li a',
                                      text: I18n.t('course.virtual_classrooms.sidebar_title'))
      end
    end
  end
end
