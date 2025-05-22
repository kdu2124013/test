"use client";

import dayjs from "dayjs";
import "dayjs/locale/ko";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { Todo } from "@/types/todo.type";
import { TodoFormData } from "./TodoForm";
import TodoList from "./TodoList";
import useModal from "@/hooks/useModal";
import CheckIcon from "@/components/icons/todo-list/Check";
import CircleCheckFill from "@/components/icons/todo-list/CircleCheckFill";
import ThumbUp from "@/components/icons/todo-list/ThumbUp";
import { useAddTodo } from "@/hooks/useAddTodo";
import QuickAddTodoForm from "./QuickAddTodoForm";
import { useState, useEffect } from "react";
import { Button } from "@/components/button";
import { useTodos } from "@/hooks/useTodos";
import { useUserData } from "@/hooks/useUserData";

interface TodoListContainerProps {
  todos: Todo[];
  selectedDate: Date;
  onSubmit?: (data: TodoFormData) => Promise<void>;
}

const TodoListContainer = ({ todos, selectedDate, onSubmit }: TodoListContainerProps) => {
  // const [editingTodo, setEditingTodo] = useState<Todo>();
  const [isDesktop, setIsDesktop] = useState(false);
  const { Modal, openModal } = useModal();
  const { handleAddTodoSubmit } = useAddTodo(selectedDate);
  const { data: userData } = useUserData();
  const { deleteTodo, addTodo } = useTodos(userData?.user_id || '');

  const handleAddTodoWithTimeCheck = async (data: TodoFormData) => {
    const now = dayjs();
    const selectedDateTime = dayjs(selectedDate);
    
    // 시간이 지정된 경우
    if (data.eventTime) {
      const [hours, minutes] = data.eventTime;
      const todoDateTime = selectedDateTime.hour(hours).minute(minutes);
      
      // 현재 시간보다 이전인 경우
      if (todoDateTime.isBefore(now)) {
        openModal({
          message: "현재 시간보다 이전 시간은 등록할 수 없습니다.",
          confirmButton: { text: "확인", style: "확인" }
        });
        return;
      }
    } else {
      // 종일 일정인 경우, 선택된 날짜가 오늘인지 확인
      if (selectedDateTime.isBefore(now, 'day')) {
        openModal({
          message: "오늘 이전 날짜에는 일정을 등록할 수 없습니다.",
          confirmButton: { text: "확인", style: "확인" }
        });
        return;
      }
    }
    
    await handleAddTodoSubmit(data);
  };

  useEffect(() => {
    const updateIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1200);
    };
    updateIsDesktop();

    window.addEventListener("resize", updateIsDesktop);

    return () => window.removeEventListener("resize", updateIsDesktop);
  }, []);

  dayjs.locale("ko");
  dayjs.extend(weekOfYear);

  // refactoring to be : TodoList.tsx로 로직 이동, 애는 Container의 역할만 하도록 분리하기
  const sortTodos = (a: Todo, b: Todo) => {
    const getDate = (todo: Todo) => {
      return todo.is_all_day_event === false
        ? new Date(todo.event_datetime ?? todo.created_at)
        : new Date(todo.created_at);
    };

    if (a.is_all_day_event !== b.is_all_day_event) {
      return a.is_all_day_event ? 1 : -1;
    }

    const dateA = getDate(a);
    const dateB = getDate(b);

    return dateA.getTime() - dateB.getTime();
  };

  const todayTodos = todos
    .filter((todo) => !todo.is_done && dayjs(todo.event_datetime).isSame(selectedDate, "day"))
    .sort(sortTodos);

  const completedTodayTodos = todos
    .filter((todo) => todo.is_done && dayjs(todo.event_datetime).isSame(selectedDate, "day"))
    .sort(sortTodos);

  const isAllCompleted = todayTodos.length === 0 && completedTodayTodos.length > 0;

  // const handleEditClick = (todo: Todo) => {
  //   setEditingTodo(todo);
  // };

  const TodoListNode = (
    <>
      <TodoList
        // onClick={handleEditClick}
        todos={todayTodos}
        title={<h2 className="text-sh4 text-pai-700">오늘 할 일</h2>}
        className="desktop:border-2 desktop:border-pai-400"
        contents={
          isAllCompleted ? (
            <div className="flex items-center w-full min-w-[19.9375rem] px-[1.25rem] py-[1rem] rounded-full bg-pai-400">
              <ThumbUp className="w-[1.25rem] h-[1.25rem] mr-[0.75rem] text-system-white" />
              <p className="text-bc4 text-system-white">와우~ 할 일을 모두 완료하셨어요!</p>
            </div>
          ) : (
            <div className="flex items-center w-full min-w-[19.9375rem] px-[1.25rem] py-[1rem] rounded-full bg-gray-100">
              <CheckIcon className="w-[1.25rem] h-[1.25rem] mr-[0.75rem] text-gray-400" />
              <p className="text-bc4 text-gray-400">작성된 투두리스트가 없습니다</p>
            </div>
          )
        }
        inlineForm={<QuickAddTodoForm onSubmit={handleAddTodoWithTimeCheck} selectedDate={selectedDate} />}
      />

      <TodoList
        // onClick={handleEditClick}
        todos={completedTodayTodos}
        title={<h2 className="text-sh4 text-gray-700">완료한 일</h2>}
        className="desktop:border-2 desktop:border-gray-400"
        contents={
          completedTodayTodos.length === 0 ? (
            <div className="flex items-center w-full min-w-[19.9375rem] px-[1.25rem] py-[1rem] rounded-full bg-gray-100">
              <CircleCheckFill className="w-[1.25rem] h-[1.25rem] mr-[0.75rem] text-gray-400" />
              <p className="text-bc4 text-gray-400">완성된 투두리스트가 없습니다</p>
            </div>
          ) : null
        }
      />

      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-sh4 text-gray-700">전주 일정 복사</h2>
        <div className="flex gap-2">
          <Button
            variant="linedGrayScale"
            className="flex-1 py-2 border-gray-200 hover:bg-gray-100"
            onClick={() => {
              const previousWeekDate = dayjs(selectedDate).subtract(7, 'day');
              const previousWeekTodos = todos.filter(todo => 
                dayjs(todo.event_datetime).isSame(previousWeekDate, 'day')
              );
              
              previousWeekTodos.forEach(todo => {
                const newTodo = {
                  title: todo.todo_title || '',
                  description: todo.todo_description || '',
                  eventTime: todo.event_datetime ? [new Date(todo.event_datetime).getHours(), new Date(todo.event_datetime).getMinutes()] as [number, number] : null,
                  address: typeof todo.address === 'object' && todo.address !== null ? {
                    coord: {
                      lat: (todo.address as any).coord?.lat || 0,
                      lng: (todo.address as any).coord?.lng || 0
                    },
                    placeName: (todo.address as any).placeName,
                    address: (todo.address as any).address,
                    roadAddress: (todo.address as any).roadAddress
                  } : undefined
                };
                handleAddTodoWithTimeCheck(newTodo);
              });
            }}
          >
            전주 같은 요일 복사
          </Button>
          <Button
            variant="linedGrayScale"
            className="flex-1 py-2 border-gray-200 hover:bg-gray-100"
            onClick={async () => {
              const currentDate = dayjs(selectedDate);
              const currentWeekStart = currentDate.startOf('week');
              const currentWeekNumber = currentDate.week();
              
              // 이전 주의 시작일 계산
              let previousWeekStart;
              if (currentWeekNumber === 1) {
                // 1주차인 경우 전달 마지막 주의 일정을 가져옴
                previousWeekStart = currentDate.subtract(1, 'month').endOf('month').startOf('week');
              } else {
                // 그 외의 경우 이전 주의 일정을 가져옴
                previousWeekStart = currentDate.subtract(1, 'week').startOf('week');
              }
              
              const previousWeekEnd = previousWeekStart.endOf('week');
              
              const previousWeekTodos = todos.filter(todo => {
                const todoDate = dayjs(todo.event_datetime);
                return todoDate.isAfter(previousWeekStart) && todoDate.isBefore(previousWeekEnd);
              });
              
              // 각 요일별로 일정을 그룹화
              const todosByDay = previousWeekTodos.reduce((acc, todo) => {
                const day = dayjs(todo.event_datetime).day();
                if (!acc[day]) {
                  acc[day] = [];
                }
                acc[day].push(todo);
                return acc;
              }, {} as Record<number, Todo[]>);

              // 각 요일별로 일정 복사
              for (let day = 0; day < 7; day++) {
                const targetDate = currentWeekStart.add(day, 'day');
                const dayTodos = todosByDay[day] || [];
                
                for (const todo of dayTodos) {
                  const eventDateTime = todo.event_datetime
                    ? dayjs(targetDate)
                        .set('hour', dayjs(todo.event_datetime).hour())
                        .set('minute', dayjs(todo.event_datetime).minute())
                        .toISOString()
                    : dayjs(targetDate).set('hour', 0).set('minute', 0).toISOString();

                  await addTodo({
                    todo_title: todo.todo_title || '',
                    todo_description: todo.todo_description || '',
                    event_datetime: eventDateTime,
                    address: todo.address as any,
                    is_chat: false,
                    is_all_day_event: !todo.event_datetime
                  });
                }
              }
            }}
          >
            전주 일주일 복사
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-sh4 text-gray-700">일정 관리</h2>
        <Button
          variant="linedGrayScale"
          className="w-full py-2 border-gray-200 hover:bg-gray-100 text-red-500"
          onClick={() => {
            openModal(
              {
                message: "선택한 날짜의 모든 일정이 삭제됩니다.\n정말 삭제하시겠습니까?",
                confirmButton: { text: "삭제", style: "삭제" }
              },
              async () => {
                const todayTodos = todos.filter(todo => 
                  dayjs(todo.event_datetime).isSame(selectedDate, 'day')
                );
                for (const todo of todayTodos) {
                  await deleteTodo(todo.todo_id);
                }
              }
            );
          }}
        >
          오늘 일정 전체 삭제
        </Button>
      </div>
    </>
  );

  return (
    <>
      <Modal />
      <div className="flex flex-col w-full h-full mobile:pb-[100px] px-4 gap-[1.25rem] desktop:gap-[2rem] desktop:p-0">
        {isDesktop ? (
          <>
            <div className="flex flex-col w-full h-full px-4 gap-[1.25rem] desktop:gap-[2rem] desktop:p-0 rounded-t-[5.63rem] bg-system-white bg-gradient-to-b">
              <div className="flex flex-col items-start self-stretch h-full">
                <div className="w-full flex flex-col items-center gap-[0.625rem] px-[3.25rem] py-[1.75rem]">
                  <p className="text-bc2 text-pai-900">{dayjs(selectedDate).format("YYYY년 M월 D일 ddd요일")}</p>
                </div>
                <div className="w-full bg-gradient-to-b flex flex-col gap-[2rem] px-[2.75rem] py-[2rem] pb-[78px] overflow-y-auto scrollbar-hide scrollbar-smooth">
                  {TodoListNode}
                </div>
              </div>
            </div>
          </>
        ) : (
          TodoListNode
        )}
        {/* <EditTodoDrawer todo={editingTodo} onClose={() => setEditingTodo(undefined)} /> */}
      </div>
    </>
  );
};

export default TodoListContainer;
