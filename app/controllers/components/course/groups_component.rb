class Course::GroupsComponent
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        title: I18n.t('course.groups.sidebar_title'),
        path: course_groups_path(current_course)
      }
    ]
  end
end
