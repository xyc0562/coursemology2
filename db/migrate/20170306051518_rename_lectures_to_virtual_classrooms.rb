class RenameLecturesToVirtualClassrooms < ActiveRecord::Migration
  def change
    rename_table :course_lectures, :course_virtual_classrooms
  end
end
