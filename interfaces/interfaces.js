declare class Promise<T> {
  constuctor(resolve: function, reject: function): Promise<T>;
  resolve(t: T) : void;
  reject(t: any) : void;
  then<K>(f: function) : Promise<K>;
  then<K>(f: function, r: function) : Promise<K>;
}

type VariableNode = {
  [key: string]: string
};

type VariablesType = {
  values: Array<VariableNode>,
  path: string
};
